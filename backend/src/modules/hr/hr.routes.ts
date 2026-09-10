import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../lib/http';
import { HttpError } from '../../middleware/error';
import { authenticate, authorize } from '../../middleware/auth';
import { encrypt, decrypt, mask } from '../../lib/crypto';

export const hrRouter = Router();
hrRouter.use(authenticate);

/* ---------- Salariés ---------- */

const employeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  jobTitle: z.string().min(1),
  department: z.string().min(1),
  contractType: z.enum(['CDI', 'CDD', 'ALTERNANCE', 'STAGE', 'INTERIM']),
  startDate: z.coerce.date(),
  managerId: z.string().optional(),
  iban: z.string().optional(),
  socialNumber: z.string().optional(),
});

hrRouter.get(
  '/employees',
  asyncHandler(async (req, res) => {
    const employees = await prisma.employee.findMany({
      where: { companyId: req.auth!.companyId },
      orderBy: { lastName: 'asc' },
    });
    res.json(
      employees.map((e) => ({
        ...e,
        ibanEncrypted: undefined,
        socialNumberEncrypted: undefined,
        ibanMasked: e.ibanEncrypted ? mask(decrypt(e.ibanEncrypted)) : null,
      })),
    );
  }),
);

hrRouter.post(
  '/employees',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const body = employeeSchema.parse(req.body);
    const employee = await prisma.employee.create({
      data: {
        companyId: req.auth!.companyId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        jobTitle: body.jobTitle,
        department: body.department,
        contractType: body.contractType,
        startDate: body.startDate,
        managerId: body.managerId,
        status: 'ONBOARDING',
        ibanEncrypted: body.iban ? encrypt(body.iban) : null,
        socialNumberEncrypted: body.socialNumber ? encrypt(body.socialNumber) : null,
      },
    });
    res.status(201).json({ ...employee, ibanEncrypted: undefined, socialNumberEncrypted: undefined });
  }),
);

/* ---------- Absences ---------- */

const absenceSchema = z.object({
  employeeId: z.string(),
  type: z.enum(['PAID_LEAVE', 'RTT', 'SICK', 'UNPAID', 'FAMILY', 'OTHER']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  days: z.number().positive(),
  reason: z.string().optional(),
});

hrRouter.get(
  '/absences',
  asyncHandler(async (req, res) => {
    const status = z.enum(['PENDING', 'APPROVED', 'REFUSED', 'RECORDED']).optional().parse(req.query.status);
    const absences = await prisma.absence.findMany({
      where: { status, employee: { companyId: req.auth!.companyId } },
      include: { employee: { select: { firstName: true, lastName: true } } },
      orderBy: { startDate: 'asc' },
    });
    res.json(absences);
  }),
);

hrRouter.post(
  '/absences',
  asyncHandler(async (req, res) => {
    const body = absenceSchema.parse(req.body);
    const employee = await prisma.employee.findFirst({
      where: { id: body.employeeId, companyId: req.auth!.companyId },
    });
    if (!employee) throw new HttpError(404, 'Salarié introuvable');
    const absence = await prisma.absence.create({ data: { ...body, status: 'PENDING' } });
    res.status(201).json(absence);
  }),
);

hrRouter.patch(
  '/absences/:id',
  authorize('ADMIN', 'HR', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const decision = z.object({ status: z.enum(['APPROVED', 'REFUSED']) }).parse(req.body);
    const absence = await prisma.absence.findFirst({
      where: { id: req.params.id, employee: { companyId: req.auth!.companyId } },
    });
    if (!absence) throw new HttpError(404, 'Demande introuvable');
    const updated = await prisma.absence.update({
      where: { id: absence.id },
      data: { status: decision.status, decidedById: req.auth!.sub, decidedAt: new Date() },
    });
    res.json(updated);
  }),
);
