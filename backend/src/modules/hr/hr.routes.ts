import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../lib/http';
import { HttpError } from '../../middleware/error';
import { authenticate, authorize } from '../../middleware/auth';
import { encrypt } from '../../lib/crypto';
import { logActivity } from '../../lib/activity';
import {
  employeeDTO,
  absenceDTO,
  shiftDTO,
  payslipDTO,
  documentDTO,
  requestDTO,
} from '../../lib/serialize';

export const hrRouter = Router();
hrRouter.use(authenticate);

/** Identifiant du salarié rattaché au compte courant (null si non rattaché). */
async function selfEmployeeId(userId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { employeeId: true } });
  return u?.employeeId ?? null;
}

/** Un compte EMPLOYEE ne voit que ses propres ressources. */
function scopeToSelf(role: string) {
  return role === 'EMPLOYEE';
}

/* ================================================================== */
/*  Salariés                                                          */
/* ================================================================== */

const employeeCreate = z.object({
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
      include: { manager: { select: { firstName: true, lastName: true } } },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    res.json(employees.map(employeeDTO));
  }),
);

hrRouter.get(
  '/employees/:id',
  asyncHandler(async (req, res) => {
    const e = await prisma.employee.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
      include: { manager: { select: { firstName: true, lastName: true } } },
    });
    if (!e) throw new HttpError(404, 'Salarié introuvable');
    res.json(employeeDTO(e));
  }),
);

hrRouter.post(
  '/employees',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const body = employeeCreate.parse(req.body);
    const e = await prisma.employee.create({
      data: {
        companyId: req.auth!.companyId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        jobTitle: body.jobTitle,
        department: body.department,
        contractType: body.contractType,
        startDate: body.startDate,
        managerId: body.managerId || null,
        status: 'ONBOARDING',
        ibanEncrypted: body.iban ? encrypt(body.iban) : null,
        socialNumberEncrypted: body.socialNumber ? encrypt(body.socialNumber) : null,
      },
      include: { manager: { select: { firstName: true, lastName: true } } },
    });
    await logActivity(
      req.auth!.companyId,
      `Nouveau salarié : ${e.firstName} ${e.lastName} (${e.department}).`,
    );
    res.status(201).json(employeeDTO(e));
  }),
);

const employeeUpdate = z.object({
  jobTitle: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  status: z
    .enum(['ACTIVE', 'ONBOARDING', 'PROBATION', 'ON_LEAVE', 'OFFBOARDING', 'LEFT'])
    .optional(),
  managerId: z.string().nullable().optional(),
  paidLeaveBalance: z.number().min(0).optional(),
  rttBalance: z.number().min(0).optional(),
  recoveryBalance: z.number().min(0).optional(),
});

hrRouter.patch(
  '/employees/:id',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const body = employeeUpdate.parse(req.body);
    const exists = await prisma.employee.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
    });
    if (!exists) throw new HttpError(404, 'Salarié introuvable');
    const e = await prisma.employee.update({
      where: { id: req.params.id },
      data: body,
      include: { manager: { select: { firstName: true, lastName: true } } },
    });
    res.json(employeeDTO(e));
  }),
);

const contactUpdate = z.object({
  phone: z.string().max(40).optional(),
  address: z.string().max(200).optional(),
});

hrRouter.patch(
  '/employees/:id/contact',
  asyncHandler(async (req, res) => {
    const body = contactUpdate.parse(req.body);
    const target = await prisma.employee.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
    });
    if (!target) throw new HttpError(404, 'Salarié introuvable');
    const isSelf = (await selfEmployeeId(req.auth!.sub)) === target.id;
    if (!isSelf && req.auth!.role === 'EMPLOYEE') throw new HttpError(403, 'Accès refusé');
    const e = await prisma.employee.update({
      where: { id: target.id },
      data: body,
      include: { manager: { select: { firstName: true, lastName: true } } },
    });
    res.json(employeeDTO(e));
  }),
);

/* ================================================================== */
/*  Absences                                                          */
/* ================================================================== */

const absenceCreate = z.object({
  employeeId: z.string().optional(), // ignoré pour un compte EMPLOYEE (forcé à soi)
  type: z.enum(['PAID_LEAVE', 'RTT', 'SICK', 'UNPAID', 'FAMILY', 'OTHER']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().max(500).optional(),
});

/** Jours ouvrés entre deux dates incluses. */
function businessDays(from: Date, to: Date): number {
  if (Number.isNaN(+from) || Number.isNaN(+to) || to < from) return 1;
  let n = 0;
  for (const c = new Date(from); c <= to; c.setDate(c.getDate() + 1)) {
    const day = c.getDay();
    if (day !== 0 && day !== 6) n++;
  }
  return n || 1;
}

hrRouter.get(
  '/absences',
  asyncHandler(async (req, res) => {
    const status = z
      .enum(['PENDING', 'APPROVED', 'REFUSED', 'RECORDED'])
      .optional()
      .parse(req.query.status || undefined);
    const where: Record<string, unknown> = {
      status,
      employee: { companyId: req.auth!.companyId },
    };
    if (scopeToSelf(req.auth!.role) || req.query.mine === '1') {
      const me = await selfEmployeeId(req.auth!.sub);
      where.employeeId = me ?? '__none__';
    } else if (typeof req.query.employeeId === 'string') {
      where.employeeId = req.query.employeeId;
    }
    const absences = await prisma.absence.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true } } },
      orderBy: { startDate: 'desc' },
    });
    res.json(absences.map(absenceDTO));
  }),
);

hrRouter.post(
  '/absences',
  asyncHandler(async (req, res) => {
    const body = absenceCreate.parse(req.body);
    let employeeId = body.employeeId;
    if (scopeToSelf(req.auth!.role)) {
      employeeId = (await selfEmployeeId(req.auth!.sub)) ?? undefined;
    }
    if (!employeeId) throw new HttpError(400, 'Salarié non précisé');
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, companyId: req.auth!.companyId },
    });
    if (!employee) throw new HttpError(404, 'Salarié introuvable');

    const days = businessDays(body.startDate, body.endDate);
    const absence = await prisma.absence.create({
      data: {
        employeeId,
        type: body.type,
        startDate: body.startDate,
        endDate: body.endDate,
        days,
        reason: body.reason,
        status: 'PENDING',
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    await logActivity(
      req.auth!.companyId,
      `Demande d'absence de ${employee.firstName} ${employee.lastName} : ${body.type}, ${days} j.`,
    );
    res.status(201).json(absenceDTO(absence));
  }),
);

hrRouter.patch(
  '/absences/:id',
  authorize('ADMIN', 'HR', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(['APPROVED', 'REFUSED']) }).parse(req.body);
    const absence = await prisma.absence.findFirst({
      where: { id: req.params.id, employee: { companyId: req.auth!.companyId } },
      include: { employee: true },
    });
    if (!absence) throw new HttpError(404, 'Demande introuvable');

    const updated = await prisma.$transaction(async (tx) => {
      const a = await tx.absence.update({
        where: { id: absence.id },
        data: { status, decidedById: req.auth!.sub, decidedAt: new Date() },
        include: { employee: { select: { firstName: true, lastName: true } } },
      });
      // Décompte du solde à la validation d'un congé payé ou d'un RTT.
      if (status === 'APPROVED' && (absence.type === 'PAID_LEAVE' || absence.type === 'RTT')) {
        const field = absence.type === 'PAID_LEAVE' ? 'paidLeaveBalance' : 'rttBalance';
        await tx.employee.update({
          where: { id: absence.employeeId },
          data: { [field]: { decrement: absence.days } },
        });
      }
      return a;
    });
    await logActivity(
      req.auth!.companyId,
      `Absence ${status === 'APPROVED' ? 'validée' : 'refusée'} — ${absence.employee.firstName} ${absence.employee.lastName}.`,
    );
    res.json(absenceDTO(updated));
  }),
);

/* ================================================================== */
/*  Planning / temps de travail                                       */
/* ================================================================== */

hrRouter.get(
  '/shifts',
  asyncHandler(async (req, res) => {
    const where: Record<string, unknown> = { employee: { companyId: req.auth!.companyId } };
    if (scopeToSelf(req.auth!.role) || req.query.mine === '1') {
      where.employeeId = (await selfEmployeeId(req.auth!.sub)) ?? '__none__';
    } else if (typeof req.query.employeeId === 'string') {
      where.employeeId = req.query.employeeId;
    }
    if (typeof req.query.from === 'string') {
      where.date = { gte: new Date(req.query.from) };
    }
    const shifts = await prisma.shift.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    res.json(shifts.map(shiftDTO));
  }),
);

const shiftCreate = z.object({
  employeeId: z.string(),
  date: z.coerce.date(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
});

hrRouter.post(
  '/shifts',
  authorize('ADMIN', 'HR', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const body = shiftCreate.parse(req.body);
    const employee = await prisma.employee.findFirst({
      where: { id: body.employeeId, companyId: req.auth!.companyId },
    });
    if (!employee) throw new HttpError(404, 'Salarié introuvable');
    const shift = await prisma.shift.create({
      data: body,
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    res.status(201).json(shiftDTO(shift));
  }),
);

/* ================================================================== */
/*  Bulletins de paie                                                 */
/* ================================================================== */

hrRouter.get(
  '/payslips',
  asyncHandler(async (req, res) => {
    const where: Record<string, unknown> = { employee: { companyId: req.auth!.companyId } };
    if (scopeToSelf(req.auth!.role) || req.query.mine === '1') {
      where.employeeId = (await selfEmployeeId(req.auth!.sub)) ?? '__none__';
    } else if (typeof req.query.employeeId === 'string') {
      where.employeeId = req.query.employeeId;
    }
    const payslips = await prisma.payslip.findMany({ where, orderBy: { releasedAt: 'desc' } });
    res.json(payslips.map(payslipDTO));
  }),
);

/* ================================================================== */
/*  Documents RH (coffre-fort) + bibliothèque de modèles             */
/* ================================================================== */

hrRouter.get(
  '/documents',
  asyncHandler(async (req, res) => {
    const where: Record<string, unknown> = { employee: { companyId: req.auth!.companyId } };
    if (scopeToSelf(req.auth!.role) || req.query.mine === '1') {
      const me = await selfEmployeeId(req.auth!.sub);
      delete where.employee;
      where.OR = [{ employeeId: me ?? '__none__' }, { employeeId: null }];
    } else if (typeof req.query.employeeId === 'string') {
      where.employeeId = req.query.employeeId;
    }
    const docs = await prisma.hrDocument.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(docs.map(documentDTO));
  }),
);

hrRouter.get(
  '/document-templates',
  asyncHandler(async (req, res) => {
    const templates = await prisma.documentTemplate.findMany({
      where: { companyId: req.auth!.companyId },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(
      templates.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        uses: t.uses,
        updatedAt: t.updatedAt.toISOString(),
      })),
    );
  }),
);

/* ================================================================== */
/*  Entretiens                                                        */
/* ================================================================== */

hrRouter.get(
  '/reviews',
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      where: { employee: { companyId: req.auth!.companyId }, completedAt: null },
      include: { employee: { select: { firstName: true, lastName: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    res.json(
      reviews.map((r) => ({
        id: r.id,
        employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
        campaign: r.campaign,
        type: r.type,
        scheduledAt: r.scheduledAt.toISOString(),
      })),
    );
  }),
);

hrRouter.get(
  '/review-campaigns',
  asyncHandler(async (req, res) => {
    const campaigns = await prisma.reviewCampaign.findMany({
      where: { companyId: req.auth!.companyId },
      orderBy: { deadline: 'asc' },
    });
    res.json(
      campaigns.map((c) => ({
        ...c,
        deadline: c.deadline.toISOString(),
        createdAt: c.createdAt.toISOString(),
      })),
    );
  }),
);

hrRouter.post(
  '/review-campaigns',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().min(1),
        type: z.string().min(1),
        deadline: z.coerce.date(),
        total: z.number().int().nonnegative().default(0),
      })
      .parse(req.body);
    const c = await prisma.reviewCampaign.create({
      data: { ...body, companyId: req.auth!.companyId },
    });
    res
      .status(201)
      .json({ ...c, deadline: c.deadline.toISOString(), createdAt: c.createdAt.toISOString() });
  }),
);

/* ================================================================== */
/*  Compétences                                                       */
/* ================================================================== */

hrRouter.get(
  '/skills',
  asyncHandler(async (req, res) => {
    const [skills, links] = await Promise.all([
      prisma.skill.findMany({ orderBy: { name: 'asc' } }),
      prisma.employeeSkill.findMany({
        where: { employee: { companyId: req.auth!.companyId } },
        include: { employee: { select: { id: true, firstName: true, lastName: true } } },
      }),
    ]);
    const byEmployee = new Map<
      string,
      { id: string; name: string; levels: Record<string, number> }
    >();
    for (const l of links) {
      const key = l.employee.id;
      if (!byEmployee.has(key)) {
        byEmployee.set(key, {
          id: l.employee.id,
          name: `${l.employee.firstName} ${l.employee.lastName}`,
          levels: {},
        });
      }
      byEmployee.get(key)!.levels[l.skillId] = l.level;
    }
    res.json({ skills, matrix: [...byEmployee.values()] });
  }),
);

hrRouter.post(
  '/skills',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const { name } = z.object({ name: z.string().min(1) }).parse(req.body);
    const skill = await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
    res.status(201).json(skill);
  }),
);

// Évaluation d'une compétence pour un salarié (création ou mise à jour du niveau).
hrRouter.put(
  '/employee-skills',
  authorize('ADMIN', 'HR', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        employeeId: z.string(),
        skillId: z.string(),
        level: z.number().int().min(1).max(5),
      })
      .parse(req.body);
    const employee = await prisma.employee.findFirst({
      where: { id: body.employeeId, companyId: req.auth!.companyId },
    });
    if (!employee) throw new HttpError(404, 'Salarié introuvable');
    const link = await prisma.employeeSkill.upsert({
      where: { employeeId_skillId: { employeeId: body.employeeId, skillId: body.skillId } },
      update: { level: body.level },
      create: body,
    });
    res.json(link);
  }),
);

hrRouter.get(
  '/development-plans',
  asyncHandler(async (req, res) => {
    const plans = await prisma.developmentPlan.findMany({
      where: { employee: { companyId: req.auth!.companyId } },
      include: { employee: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      plans.map((p) => ({
        id: p.id,
        employeeName: `${p.employee.firstName} ${p.employee.lastName}`,
        goal: p.goal,
        progress: p.progress,
        status: p.status,
      })),
    );
  }),
);

/* ================================================================== */
/*  Onboarding / offboarding                                          */
/* ================================================================== */

hrRouter.get(
  '/onboarding',
  asyncHandler(async (req, res) => {
    const kind = z
      .enum(['ONBOARDING', 'OFFBOARDING'])
      .optional()
      .parse(req.query.kind || undefined);
    const journeys = await prisma.onboardingJourney.findMany({
      where: { kind, employee: { companyId: req.auth!.companyId } },
      include: {
        employee: { select: { firstName: true, lastName: true, jobTitle: true } },
        tasks: { orderBy: { position: 'asc' } },
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(
      journeys.map((j) => {
        const done = j.tasks.filter((t) => t.done).length;
        return {
          id: j.id,
          kind: j.kind,
          employeeName: `${j.employee.firstName} ${j.employee.lastName}`,
          jobTitle: j.employee.jobTitle,
          startDate: j.startDate.toISOString(),
          progress: j.tasks.length ? Math.round((done / j.tasks.length) * 100) : 0,
          tasks: j.tasks.map((t) => ({ id: t.id, label: t.label, done: t.done })),
        };
      }),
    );
  }),
);

// Modèles de checklist par type de parcours.
const JOURNEY_TEMPLATES: Record<'ONBOARDING' | 'OFFBOARDING', string[]> = {
  ONBOARDING: [
    'Contrat signé électroniquement',
    'DPAE effectuée',
    'Compte e-mail & accès créés',
    'Matériel attribué (ordinateur, badge)',
    'Parcours de formation sécurité',
    'Rendez-vous manager J+7',
  ],
  OFFBOARDING: [
    'Entretien de départ planifié',
    'Restitution du matériel',
    'Clôture des accès',
    'Solde de tout compte préparé',
    'Certificat de travail & attestation France Travail',
  ],
};

hrRouter.post(
  '/onboarding',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        employeeId: z.string(),
        kind: z.enum(['ONBOARDING', 'OFFBOARDING']),
        startDate: z.coerce.date(),
      })
      .parse(req.body);

    const employee = await prisma.employee.findFirst({
      where: { id: body.employeeId, companyId: req.auth!.companyId },
    });
    if (!employee) throw new HttpError(404, 'Salarié introuvable');

    const journey = await prisma.onboardingJourney.create({
      data: {
        employeeId: body.employeeId,
        kind: body.kind,
        startDate: body.startDate,
        tasks: {
          create: JOURNEY_TEMPLATES[body.kind].map((label, position) => ({ label, position })),
        },
      },
      include: {
        employee: { select: { firstName: true, lastName: true, jobTitle: true } },
        tasks: { orderBy: { position: 'asc' } },
      },
    });

    // Aligne le statut du salarié sur le type de parcours.
    await prisma.employee.update({
      where: { id: body.employeeId },
      data: { status: body.kind === 'ONBOARDING' ? 'ONBOARDING' : 'OFFBOARDING' },
    });
    await logActivity(
      req.auth!.companyId,
      `Parcours ${body.kind === 'ONBOARDING' ? "d'intégration" : 'de départ'} lancé — ${employee.firstName} ${employee.lastName}.`,
    );

    res.status(201).json({
      id: journey.id,
      kind: journey.kind,
      employeeName: `${journey.employee.firstName} ${journey.employee.lastName}`,
      jobTitle: journey.employee.jobTitle,
      startDate: journey.startDate.toISOString(),
      progress: 0,
      tasks: journey.tasks.map((t) => ({ id: t.id, label: t.label, done: t.done })),
    });
  }),
);

hrRouter.patch(
  '/onboarding/tasks/:id',
  authorize('ADMIN', 'HR', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const { done } = z.object({ done: z.boolean() }).parse(req.body);
    const task = await prisma.onboardingTask.findFirst({
      where: { id: req.params.id, journey: { employee: { companyId: req.auth!.companyId } } },
    });
    if (!task) throw new HttpError(404, 'Tâche introuvable');
    const updated = await prisma.onboardingTask.update({ where: { id: task.id }, data: { done } });
    res.json({ id: updated.id, label: updated.label, done: updated.done });
  }),
);

/* ================================================================== */
/*  Demandes salarié (attestation, note de frais…)                    */
/* ================================================================== */

hrRouter.get(
  '/requests',
  asyncHandler(async (req, res) => {
    const where: Record<string, unknown> = { employee: { companyId: req.auth!.companyId } };
    if (scopeToSelf(req.auth!.role) || req.query.mine === '1') {
      delete where.employee;
      where.employeeId = (await selfEmployeeId(req.auth!.sub)) ?? '__none__';
    }
    const requests = await prisma.employeeRequest.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests.map(requestDTO));
  }),
);

hrRouter.post(
  '/requests',
  asyncHandler(async (req, res) => {
    const body = z
      .object({ kind: z.string().min(1), message: z.string().max(500).optional() })
      .parse(req.body);
    const employeeId = await selfEmployeeId(req.auth!.sub);
    if (!employeeId) throw new HttpError(400, 'Compte non rattaché à un salarié');
    const r = await prisma.employeeRequest.create({
      data: { employeeId, kind: body.kind, message: body.message, status: 'PENDING' },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    await logActivity(
      req.auth!.companyId,
      `Demande « ${body.kind} » de ${r.employee!.firstName} ${r.employee!.lastName}.`,
    );
    res.status(201).json(requestDTO(r));
  }),
);

hrRouter.patch(
  '/requests/:id',
  authorize('ADMIN', 'HR'),
  asyncHandler(async (req, res) => {
    const { status } = z
      .object({ status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'REFUSED', 'REIMBURSED']) })
      .parse(req.body);
    const exists = await prisma.employeeRequest.findFirst({
      where: { id: req.params.id, employee: { companyId: req.auth!.companyId } },
    });
    if (!exists) throw new HttpError(404, 'Demande introuvable');
    const r = await prisma.employeeRequest.update({
      where: { id: req.params.id },
      data: { status, resolvedAt: status === 'PENDING' ? null : new Date() },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    res.json(requestDTO(r));
  }),
);
