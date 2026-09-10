import { prisma } from './prisma';
import { sha256 } from './crypto';

/**
 * Journal anti-fraude TVA : chaque écriture est chaînée à la précédente
 * (empreinte de l'écriture N-1 incluse dans l'empreinte N), garantissant
 * l'inaltérabilité exigée par l'administration fiscale.
 */
export async function appendVatJournal(companyId: string, event: string, payload: unknown) {
  const last = await prisma.vatJournalEntry.findFirst({
    where: { companyId },
    orderBy: { sequence: 'desc' },
  });

  const sequence = (last?.sequence ?? 0) + 1;
  const previousHash = last?.entryHash ?? '0'.repeat(64);
  const payloadHash = sha256(JSON.stringify(payload));
  const entryHash = sha256(`${companyId}|${sequence}|${event}|${payloadHash}|${previousHash}`);

  return prisma.vatJournalEntry.create({
    data: { companyId, sequence, event, payloadHash, previousHash, entryHash },
  });
}

/** Vérifie l'intégrité complète de la chaîne pour une entreprise. */
export async function verifyVatJournal(companyId: string): Promise<{ ok: boolean; brokenAt?: number }> {
  const entries = await prisma.vatJournalEntry.findMany({
    where: { companyId },
    orderBy: { sequence: 'asc' },
  });

  let previousHash = '0'.repeat(64);
  for (const e of entries) {
    const expected = sha256(`${companyId}|${e.sequence}|${e.event}|${e.payloadHash}|${previousHash}`);
    if (expected !== e.entryHash || e.previousHash !== previousHash) {
      return { ok: false, brokenAt: e.sequence };
    }
    previousHash = e.entryHash;
  }
  return { ok: true };
}
