import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../lib/http';
import { authenticate } from '../../middleware/auth';
import { localAssistantReply, generateHrDocument } from './ai.service';

export const aiRouter = Router();
aiRouter.use(authenticate);

aiRouter.post(
  '/chat',
  asyncHandler(async (req, res) => {
    const body = z.object({ message: z.string().min(1) }).parse(req.body);
    res.json({
      reply: localAssistantReply(body.message),
      tone: 'calme, professionnel, rassurant',
      disclaimer: 'Réponse générée localement — aucun fournisseur LLM externe n’est sollicité.',
    });
  }),
);

// Analyses RH : signaux faibles, prévision d'absences, climat, audit, recommandations.
aiRouter.get(
  '/insights',
  asyncHandler(async (req, res) => {
    const insights = await prisma.aiInsight.findMany({
      where: { companyId: req.auth!.companyId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(insights);
  }),
);

aiRouter.post(
  '/documents/generate',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        template: z.string().min(1),
        values: z.record(z.string()),
        employeeId: z.string().optional(),
      })
      .parse(req.body);

    const content = generateHrDocument(body.template, body.values);
    res.json({ template: body.template, content });
  }),
);

// Analyse du moral — strictement anonyme et agrégée (jamais de réponse individuelle).
aiRouter.get(
  '/mood',
  asyncHandler(async (req, res) => {
    const insight = await prisma.aiInsight.findFirst({
      where: { companyId: req.auth!.companyId, kind: 'climat' },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      anonymous: true,
      minRespondentsForDisplay: 5,
      latest: insight ?? { title: 'Climat social', body: 'Pas encore de mesure disponible.' },
    });
  }),
);
