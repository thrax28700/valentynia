import { useSyncExternalStore } from 'react';
import { uid } from './download';
import {
  employees as seedEmployees,
  absenceRequests,
  invoices as seedInvoices,
  legalAlerts as seedAlerts,
  aiInsights as seedInsights,
  myPayslips,
  myDocuments,
  me as seedMe,
} from '../data/mock';

/* ------------------------------------------------------------------ */
/*  Types                                                            */
/* ------------------------------------------------------------------ */
export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
export type User = { id: string; email: string; password: string; name: string; role: Role; employeeId: string };

export type Leave = { cp: number; rtt: number; recup: number };
export type Employee = {
  id: string; name: string; role: string; dept: string; contract: string;
  since: string; status: string; email: string; manager?: string;
  phone?: string; address?: string; iban?: string; leave: Leave;
};

export type AbsenceStatus = 'À valider' | 'Validé' | 'Refusé' | 'Enregistré';
export type Absence = {
  id: string; employeeId: string; who: string; type: string;
  from: string; to: string; days: number; status: AbsenceStatus;
  reason?: string; createdAt: string;
};

export type InvoiceLine = { label: string; qty: number; unitPrice: number; vatRate: number };
export type PpfStatus = 'Brouillon' | 'Déposée' | 'Reçue par le PPF' | 'Acceptée' | 'Rejetée' | 'Encaissée';
export type Invoice = {
  id: string; client: string; clientSiren?: string; issued: string; due: string;
  lines: InvoiceLine[]; totalHT: number; tva: number; amount: number;
  ppf: PpfStatus; paid: boolean; xml?: string; sha256?: string;
  ppfHistory: { status: string; at: string }[];
};

export type LegalAlert = { id: string; level: 'high' | 'medium' | 'low'; title: string; detail: string; due: string; resolved: boolean };
export type AiInsight = { id: string; tone: string; title: string; text: string };
export type HrDoc = { id: string; employeeId?: string; name: string; type: string; date: string; content?: string; ai?: boolean };
export type Payslip = { id: string; employeeId: string; period: string; net: number; date: string };
export type Activity = { id: string; at: string; text: string };

export type DB = {
  users: User[];
  employees: Employee[];
  absences: Absence[];
  invoices: Invoice[];
  alerts: LegalAlert[];
  insights: AiInsight[];
  documents: HrDoc[];
  payslips: Payslip[];
  activity: Activity[];
};

/* ------------------------------------------------------------------ */
/*  Amorçage depuis les données de démonstration                     */
/* ------------------------------------------------------------------ */
const statusMap: Record<string, AbsenceStatus> = {
  'À valider': 'À valider', 'Validé': 'Validé', 'Refusé': 'Refusé', 'Enregistré': 'Enregistré',
};

function seed(): DB {
  const employees: Employee[] = seedEmployees.map((e) => ({
    ...e,
    email: `${e.name.toLowerCase().normalize('NFD').replace(/[^\w]+/g, '.')}@atelier-lumen.fr`,
    leave: e.id === 'e2' ? { ...seedMe.leaveBalance } : { cp: 12 + (e.id.charCodeAt(1) % 8), rtt: 2 + (e.id.charCodeAt(1) % 3), recup: e.id.charCodeAt(1) % 2 },
    iban: 'FR7630006000011234567890189',
    manager: e.name === 'Camille Ferrand' ? undefined : 'Camille Ferrand',
  }));
  const byName = (n: string) => employees.find((e) => e.name === n)?.id ?? employees[0].id;

  const absences: Absence[] = absenceRequests.map((a) => ({
    id: a.id, employeeId: byName(a.who), who: a.who, type: a.type,
    from: a.from, to: a.to, days: a.days, status: statusMap[a.status] ?? 'Enregistré',
    createdAt: a.from,
  }));

  const invoices: Invoice[] = seedInvoices.map((v) => {
    const ht = Math.round((v.amount / 1.2) * 100) / 100;
    return {
      id: v.id, client: v.client, issued: v.issued, due: v.due,
      lines: [{ label: 'Prestations de services', qty: 1, unitPrice: ht, vatRate: 20 }],
      totalHT: ht, tva: Math.round((v.amount - ht) * 100) / 100, amount: v.amount,
      ppf: (v.ppf as PpfStatus) ?? 'Brouillon', paid: v.paid,
      ppfHistory: [{ status: v.ppf, at: v.issued }],
    };
  });

  return {
    users: [
      { id: 'u1', email: 'camille.ferrand@atelier-lumen.fr', password: 'demo1234', name: 'Camille Ferrand', role: 'ADMIN', employeeId: 'e1' },
      { id: 'u2', email: 'yanis.moreau@atelier-lumen.fr', password: 'demo1234', name: 'Yanis Moreau', role: 'EMPLOYEE', employeeId: 'e2' },
    ],
    employees,
    absences,
    invoices,
    alerts: seedAlerts.map((a, i) => ({ id: `al${i}`, resolved: false, ...a }) as LegalAlert),
    insights: seedInsights.map((a, i) => ({ id: `in${i}`, ...a })),
    documents: myDocuments.map((d, i) => ({ id: `doc${i}`, employeeId: 'e2', ...d })),
    payslips: myPayslips.map((p, i) => ({ id: `ps${i}`, employeeId: 'e2', ...p })),
    activity: [{ id: uid('act'), at: new Date().toISOString(), text: 'Espace de démonstration initialisé.' }],
  };
}

/* ------------------------------------------------------------------ */
/*  Store réactif persisté (localStorage)                            */
/* ------------------------------------------------------------------ */
const KEY = 'valentynia:db:v1';

function load(): DB | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DB) : null;
  } catch {
    return null;
  }
}
function persist(db: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* quota / mode privé : on continue en mémoire */
  }
}

let state: DB = load() ?? seed();
persist(state);
const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Mutation immuable : `fn` reçoit une copie, le résultat est persisté et diffusé. */
  set(fn: (draft: DB) => void) {
    const next: DB = JSON.parse(JSON.stringify(state));
    fn(next);
    state = next;
    persist(next);
    listeners.forEach((l) => l());
  },
  log(text: string) {
    store.set((d) => {
      d.activity.unshift({ id: uid('act'), at: new Date().toISOString(), text });
      d.activity = d.activity.slice(0, 40);
    });
  },
  reset() {
    state = seed();
    persist(state);
    listeners.forEach((l) => l());
  },
};

/**
 * Sélecteur d'état. ⚠️ Renvoyer une référence stable (une tranche `d.xxx`),
 * jamais un `.filter()`/`.map()` — filtrer/mapper ensuite dans le rendu.
 */
export function useStore<T>(selector: (db: DB) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state));
}
