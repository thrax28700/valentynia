import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../lib/http';
import { HttpError } from '../../middleware/error';
import { authenticate, authorize } from '../../middleware/auth';
import { generateFacturx } from '../../lib/facturx';
import { submitInvoice, fetchStatus } from '../../lib/ppf';
import { appendVatJournal, verifyVatJournal } from '../../lib/vatJournal';

export const billingRouter = Router();
billingRouter.use(authenticate);

const lineSchema = z.object({
  label: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  vatRate: z.number().min(0).max(100),
});

const invoiceSchema = z.object({
  number: z.string().min(1),
  clientName: z.string().min(1),
  clientSiren: z.string().optional(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  currency: z.string().default('EUR'),
  lines: z.array(lineSchema).min(1),
});

billingRouter.get(
  '/invoices',
  asyncHandler(async (req, res) => {
    const invoices = await prisma.invoice.findMany({
      where: { companyId: req.auth!.companyId },
      include: { lines: true, ppfHistory: { orderBy: { occurredAt: 'desc' } } },
      orderBy: { issueDate: 'desc' },
    });
    res.json(invoices);
  }),
);

// Création d'une facture + génération Factur-X (PDF/A-3 + XML CII).
billingRouter.post(
  '/invoices',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const body = invoiceSchema.parse(req.body);
    const company = await prisma.company.findUniqueOrThrow({ where: { id: req.auth!.companyId } });

    const facturx = generateFacturx({
      number: body.number,
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
        number: body.number,
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
      },
      include: { lines: true },
    });

    await appendVatJournal(company.id, `INVOICE_ISSUED:${invoice.number}`, {
      total: facturx.totals.totalInclVat,
      sha256: facturx.sha256,
    });

    res.status(201).json({ invoice, facturxXml: facturx.xml });
  }),
);

// Transmission de la facture au Portail Public de Facturation.
billingRouter.post(
  '/invoices/:id/send-ppf',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
      include: { lines: true },
    });
    if (!invoice) throw new HttpError(404, 'Facture introuvable');

    const company = await prisma.company.findUniqueOrThrow({ where: { id: invoice.companyId } });
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

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        ppfStatus: result.status,
        ppfMessageId: result.messageId,
        ppfHistory: { create: { status: result.status, detail: result.detail } },
      },
      include: { ppfHistory: true },
    });

    await appendVatJournal(company.id, `PPF_SUBMIT:${invoice.number}`, result);
    res.json({ invoice: updated, simulated: result.simulated });
  }),
);

billingRouter.get(
  '/invoices/:id/ppf-status',
  asyncHandler(async (req, res) => {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
    });
    if (!invoice?.ppfMessageId) throw new HttpError(400, 'Facture non transmise au PPF');

    const { status, detail } = await fetchStatus(invoice.ppfMessageId);
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        ppfStatus: status,
        ppfHistory: { create: { status, detail } },
        paidAt: status === 'PAID' ? new Date() : invoice.paidAt,
      },
    });
    res.json(updated);
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
    res.json(entries);
  }),
);

billingRouter.get(
  '/vat-journal/verify',
  asyncHandler(async (req, res) => {
    res.json(await verifyVatJournal(req.auth!.companyId));
  }),
);
