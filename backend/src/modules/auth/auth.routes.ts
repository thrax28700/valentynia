import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';
import { asyncHandler } from '../../lib/http';
import { HttpError } from '../../middleware/error';
import { authenticate } from '../../middleware/auth';

export const authRouter = Router();

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = credentials.extend({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1),
  siren: z.string().min(9),
});

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) throw new HttpError(409, 'Un compte existe déjà avec cet e-mail');

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: 'ADMIN',
        company: {
          create: { name: body.companyName, siren: body.siren },
        },
      },
    });

    const token = signToken({ sub: user.id, companyId: user.companyId, role: user.role });
    res.status(201).json({ token, user: publicUser(user) });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = credentials.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      throw new HttpError(401, 'Identifiants incorrects');
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = signToken({ sub: user.id, companyId: user.companyId, role: user.role });
    res.json({ token, user: publicUser(user) });
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.sub },
      include: {
        company: true,
        employee: { select: { id: true, jobTitle: true, department: true } },
      },
    });
    if (!user) throw new HttpError(404, 'Compte introuvable');
    res.json({
      user: publicUser(user),
      company: {
        id: user.company.id,
        name: user.company.name,
        siren: user.company.siren,
        plan: user.company.plan,
      },
      employee: user.employee,
    });
  }),
);

function publicUser(u: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  employeeId?: string | null;
}) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    name: `${u.firstName} ${u.lastName}`,
    role: u.role,
    companyId: u.companyId,
    employeeId: u.employeeId ?? null,
  };
}
