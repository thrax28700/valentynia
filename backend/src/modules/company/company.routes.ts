import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../lib/http';
import { HttpError } from '../../middleware/error';
import { authenticate, authorize } from '../../middleware/auth';

export const companyRouter = Router();
companyRouter.use(authenticate);

async function companyDTO(companyId: string) {
  const [company, headcount] = await Promise.all([
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
    prisma.employee.count({ where: { companyId } }),
  ]);
  return {
    id: company.id,
    name: company.name,
    siren: company.siren,
    address: company.address,
    collectiveAgreement: company.collectiveAgreement,
    weeklyHours: company.weeklyHours,
    plan: company.plan,
    headcount,
  };
}

companyRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await companyDTO(req.auth!.companyId));
  }),
);

const companyUpdate = z.object({
  name: z.string().min(1).optional(),
  siren: z.string().min(9).max(14).optional(),
  address: z.string().max(200).nullable().optional(),
  collectiveAgreement: z.string().max(200).nullable().optional(),
  weeklyHours: z.number().min(0).max(60).optional(),
  plan: z.enum(['ESSENTIEL', 'BUSINESS', 'PREMIUM']).optional(),
});

companyRouter.patch(
  '/',
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const body = companyUpdate.parse(req.body);
    if (body.siren) {
      const clash = await prisma.company.findFirst({
        where: { siren: body.siren, NOT: { id: req.auth!.companyId } },
      });
      if (clash) throw new HttpError(409, 'Ce SIREN est déjà utilisé');
    }
    await prisma.company.update({ where: { id: req.auth!.companyId }, data: body });
    res.json(await companyDTO(req.auth!.companyId));
  }),
);

companyRouter.get(
  '/activity',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 40, 100);
    const activity = await prisma.activityLog.findMany({
      where: { companyId: req.auth!.companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json(
      activity.map((a) => ({ id: a.id, text: a.text, createdAt: a.createdAt.toISOString() })),
    );
  }),
);
