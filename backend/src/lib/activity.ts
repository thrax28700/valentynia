import { prisma } from './prisma';

/** Ajoute une ligne au journal d'activité de l'entreprise (fil du tableau de bord). */
export function logActivity(companyId: string, text: string) {
  return prisma.activityLog.create({ data: { companyId, text } });
}
