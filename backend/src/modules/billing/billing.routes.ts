import { Router } from 'express';
import { z } from 'zod';
import type { PpfStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../lib/http';
import { HttpError } from '../../middleware/error';
import { authenticate, authorize } from '../../middleware/auth';
import { generateFacturx, buildCiiXml } from '../../lib/facturx';
import { submitInvoice } from '../../lib/ppf';
import { appendVatJournal, verifyVatJournal } from '../../lib/vatJournal';
import { logActivity } from '../../lib/activity';
import { invoiceDTO } from '../../lib/serialize';

export const billingRouter = Router();
billingRouter.use(authenticate);

const lineSchema = z.object({
  label: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  vatRate: z.number().min(0).max(100),
});

const invoiceSchema = z.object({
  number: z.string().min(1).optional(),
  clientName: z.string().min(1),
  clientSiren: z.string().optional(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  currency: z.string().default('EUR'),
  lines: z.array(lineSchema).min(1),
});

/** Cycle de vie PPF normalisé (mode simulation) : chaque envoi fait avancer d'un cran. */
const PPF_FLOW: PpfStatus[] = ['DRAFT', 'DEPOSITED', 'RECEIVED_BY_PPF', 'ACCEPTED', 'PAID'];
function nextPpfStatus(current: PpfStatus): PpfStatus {
  if (current === 'REJECTED') return 'DEPOSITED'; // renvoi après rejet
  const i = PPF_FLOW.indexOf(current);
  return i >= 0 && i < PPF_FLOW.length - 1 ? PPF_FLOW[i + 1] : current;
}

billingRouter.get(
  '/invoices',
  asyncHandler(async (req, res) => {
    const invoices = await prisma.invoice.findMany({
      where: { companyId: req.auth!.companyId },
      include: { lines: true, ppfHistory: { orderBy: { occurredAt: 'desc' } } },
      orderBy: { issueDate: 'desc' },
    });
    res.json(invoices.map(invoiceDTO));
  }),
);

// Création d'une facture + génération Factur-X (XML CII EN 16931).
billingRouter.post(
  '/invoices',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const body = invoiceSchema.parse(req.body);
    const company = await prisma.company.findUniqueOrThrow({ where: { id: req.auth!.companyId } });

    // Numérotation continue si non fournie : F-<année>-<séquence>.
    let number = body.number;
    if (!number) {
      const year = body.issueDate.getFullYear();
      const count = await prisma.invoice.count({
        where: { companyId: company.id, number: { startsWith: `F-${year}-` } },
      });
      number = `F-${year}-${String(count + 145).padStart(4, '0')}`;
    }

    const dup = await prisma.invoice.findFirst({ where: { companyId: company.id, number } });
    if (dup) throw new HttpError(409, `La facture ${number} existe déjà`);

    const facturx = generateFacturx({
      number,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      seller: { name: company.name, siren: company.siren },
      buyer: { name: body.clientName, siren: body.clientSiren },
      currency: body.currency,
      lines: body.lines,
    });

    const archivedUntil = new Date(body.issueDate);
    archivedUntil.setFullYear(archivedUntil.getFullYear() + 10); // conservation légale

    const invoice = await prisma.invoice.create({
      data: {
        companyId: company.id,
        number,
        clientName: body.clientName,
        clientSiren: body.clientSiren,
        issueDate: body.issueDate,
        dueDate: body.dueDate,
        currency: body.currency,
        totalExclVat: facturx.totals.totalExclVat,
        vatAmount: facturx.totals.vatAmount,
        totalInclVat: facturx.totals.totalInclVat,
        facturxProfile: facturx.profile,
        facturxSha256: facturx.sha256,
        archivedUntil,
        ppfStatus: 'DRAFT',
        lines: { create: body.lines },
        ppfHistory: { create: { status: 'DRAFT', detail: 'Facture créée.' } },
      },
      include: { lines: true, ppfHistory: { orderBy: { occurredAt: 'desc' } } },
    });

    await appendVatJournal(company.id, `INVOICE_ISSUED:${invoice.number}`, {
      total: facturx.totals.totalInclVat,
      sha256: facturx.sha256,
    });
    await logActivity(
      company.id,
      `Facture Factur-X ${invoice.number} générée (${facturx.totals.totalInclVat.toFixed(2)} € TTC).`,
    );

    res.status(201).json({ invoice: invoiceDTO(invoice), facturxXml: facturx.xml });
  }),
);

// Téléchargement du XML Factur-X (CII EN 16931).
billingRouter.get(
  '/invoices/:id/facturx.xml',
  asyncHandler(async (req, res) => {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
      include: { lines: true },
    });
    if (!invoice) throw new HttpError(404, 'Facture introuvable');
    const company = await prisma.company.findUniqueOrThrow({ where: { id: invoice.companyId } });
    const xml = buildCiiXml({
      number: invoice.number,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      seller: { name: company.name, siren: company.siren },
      buyer: { name: invoice.clientName, siren: invoice.clientSiren ?? undefined },
      currency: invoice.currency,
      lines: invoice.lines.map((l) => ({
        label: l.label,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        vatRate: Number(l.vatRate),
      })),
    });
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="facturx-${invoice.number}.xml"`);
    res.send(xml);
  }),
);

// Transmission / avancement du cycle de vie PPF.
billingRouter.post(
  '/invoices/:id/send-ppf',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
      include: { lines: true },
    });
    if (!invoice) throw new HttpError(404, 'Facture introuvable');
    if (invoice.ppfStatus === 'PAID') throw new HttpError(400, 'Facture déjà encaissée');

    const company = await prisma.company.findUniqueOrThrow({ where: { id: invoice.companyId } });

    let nextStatus: PpfStatus;
    let detail: string;
    let messageId = invoice.ppfMessageId;
    let simulated = true;

    if (invoice.ppfStatus === 'DRAFT' || invoice.ppfStatus === 'REJECTED') {
      // Premier dépôt (ou renvoi) : on passe par le client PPF.
      const facturx = generateFacturx({
        number: invoice.number,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        seller: { name: company.name, siren: company.siren },
        buyer: { name: invoice.clientName, siren: invoice.clientSiren ?? undefined },
        currency: invoice.currency,
        lines: invoice.lines.map((l) => ({
          label: l.label,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          vatRate: Number(l.vatRate),
        })),
      });
      const result = await submitInvoice({
        number: invoice.number,
        facturxXml: facturx.xml,
        buyerSiren: invoice.clientSiren ?? undefined,
      });
      nextStatus = result.status as PpfStatus;
      detail = result.detail;
      messageId = result.messageId;
      simulated = result.simulated;
    } else {
      // Étapes suivantes : avancement du cycle de vie.
      nextStatus = nextPpfStatus(invoice.ppfStatus);
      detail = `Passage au statut « ${nextStatus} » (simulation).`;
    }

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        ppfStatus: nextStatus,
        ppfMessageId: messageId,
        paidAt: nextStatus === 'PAID' ? new Date() : invoice.paidAt,
        ppfHistory: { create: { status: nextStatus, detail } },
      },
      include: { lines: true, ppfHistory: { orderBy: { occurredAt: 'desc' } } },
    });

    await appendVatJournal(company.id, `PPF_ADVANCE:${invoice.number}`, { status: nextStatus });
    await logActivity(company.id, `Facture ${invoice.number} — statut PPF : ${nextStatus}.`);

    res.json({ invoice: invoiceDTO(updated), simulated });
  }),
);

// Journal anti-fraude TVA.
billingRouter.get(
  '/vat-journal',
  asyncHandler(async (req, res) => {
    const entries = await prisma.vatJournalEntry.findMany({
      where: { companyId: req.auth!.companyId },
      orderBy: { sequence: 'desc' },
      take: 100,
    });
    res.json(
      entries.map((e) => ({
        id: e.id,
        sequence: e.sequence,
        event: e.event,
        payloadHash: e.payloadHash,
        previousHash: e.previousHash,
        entryHash: e.entryHash,
        createdAt: e.createdAt.toISOString(),
      })),
    );
  }),
);

billingRouter.get(
  '/vat-journal/verify',
  asyncHandler(async (req, res) => {
    res.json(await verifyVatJournal(req.auth!.companyId));
  }),
);
