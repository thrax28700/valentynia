import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../lib/http';
import { authenticate, authorize } from '../../middleware/auth';

export const complianceRouter = Router();
complianceRouter.use(authenticate);

complianceRouter.get(
  '/alerts',
  asyncHandler(async (req, res) => {
    const alerts = await prisma.legalAlert.findMany({
      where: { companyId: req.auth!.companyId, resolved: false },
      orderBy: [{ level: 'desc' }, { dueDate: 'asc' }],
    });
    res.json(alerts);
  }),
);

const alertSchema = z.object({
  level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  title: z.string().min(1),
  detail: z.string().min(1),
  dueDate: z.coerce.date().optional(),
});

complianceRouter.post(
  '/alerts',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const body = alertSchema.parse(req.body);
    const alert = await prisma.legalAlert.create({ data: { ...body, companyId: req.auth!.companyId } });
    res.status(201).json(alert);
  }),
);

complianceRouter.patch(
  '/alerts/:id/resolve',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const alert = await prisma.legalAlert.updateMany({
      where: { id: req.params.id, companyId: req.auth!.companyId },
      data: { resolved: true },
    });
    res.json({ updated: alert.count });
  }),
);

// Vérification automatique des contrats : contrôle des clauses obligatoires.
const REQUIRED_CLAUSES: Record<string, string[]> = {
  CDI: ['identité des parties', 'fonction', 'rémunération', 'durée du travail', 'convention collective'],
  CDD: ['identité des parties', 'motif du recours', 'terme précis ou durée minimale', 'poste', 'rémunération', 'convention collective'],
};

complianceRouter.post(
  '/contracts/check',
  asyncHandler(async (req, res) => {
    const body = z
      .object({ contractType: z.enum(['CDI', 'CDD']), text: z.string().min(1) })
      .parse(req.body);
    const text = body.text.toLowerCase();
    const missing = REQUIRED_CLAUSES[body.contractType].filter(
      (clause) => !text.includes(clause.split(' ')[0]),
    );
    res.json({
      contractType: body.contractType,
      compliant: missing.length === 0,
      missingClauses: missing,
    });
  }),
);
