import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../lib/http';
import { authenticate } from '../../middleware/auth';
import { absenceDTO, invoiceDTO } from '../../lib/serialize';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

const PPF_FINAL = ['ACCEPTED', 'PAID'] as const;

/** Agrégats du tableau de bord entreprise. */
dashboardRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const companyId = req.auth!.companyId;

    const [
      headcount,
      onboardingCount,
      pendingAbsences,
      openAlerts,
      invoices,
      insights,
      alerts,
      recentAbsences,
      activity,
    ] = await Promise.all([
      prisma.employee.count({ where: { companyId } }),
      prisma.employee.count({ where: { companyId, status: 'ONBOARDING' } }),
      prisma.absence.count({ where: { status: 'PENDING', employee: { companyId } } }),
      prisma.legalAlert.count({ where: { companyId, resolved: false } }),
      prisma.invoice.findMany({
        where: { companyId },
        include: { ppfHistory: { orderBy: { occurredAt: 'desc' } } },
        orderBy: { issueDate: 'desc' },
      }),
      prisma.aiInsight.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.legalAlert.findMany({
        where: { companyId, resolved: false },
        orderBy: [{ level: 'desc' }, { dueDate: 'asc' }],
      }),
      prisma.absence.findMany({
        where: { status: 'PENDING', employee: { companyId } },
        include: { employee: { select: { firstName: true, lastName: true } } },
        orderBy: { startDate: 'asc' },
        take: 8,
      }),
      prisma.activityLog.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const outstandingAmount = invoices
      .filter((i) => !i.paidAt)
      .reduce((s, i) => s + Number(i.totalInclVat), 0);
    const openInvoices = invoices.filter((i) => !i.paidAt).length;
    const ppfPending = invoices.filter((i) => !PPF_FINAL.includes(i.ppfStatus as never)).length;
    const complianceScore = Math.max(0, Math.min(100, 100 - openAlerts * 4));

    res.json({
      headcount,
      onboardingCount,
      pendingAbsences,
      openAlerts,
      outstandingAmount,
      openInvoices,
      ppfPending,
      complianceScore,
      insights: insights.map((i) => ({
        id: i.id,
        kind: i.kind,
        title: i.title,
        body: i.body,
        severity: i.severity,
      })),
      alerts: alerts.map((a) => ({
        id: a.id,
        level: a.level,
        title: a.title,
        detail: a.detail,
        dueDate: a.dueDate?.toISOString() ?? null,
      })),
      recentAbsences: recentAbsences.map(absenceDTO),
      recentInvoices: invoices.slice(0, 5).map(invoiceDTO),
      activity: activity.map((a) => ({
        id: a.id,
        text: a.text,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  }),
);
