import type {
  Employee,
  Absence,
  Invoice,
  InvoiceLine,
  PpfEvent,
  Shift,
  Payslip,
  HrDocument,
  EmployeeRequest,
} from '@prisma/client';
import { mask, tryDecrypt } from './crypto';

/**
 * Sérialisation Prisma -> DTO d'API.
 * L'API renvoie les valeurs d'énumération brutes et des dates ISO ;
 * la traduction en libellés français est faite côté client (src/lib/labels.ts).
 */

const iso = (d: Date | null) => (d ? d.toISOString() : null);
const fullName = (e: { firstName: string; lastName: string }) => `${e.firstName} ${e.lastName}`;

export function employeeDTO(
  e: Employee & { manager?: { firstName: string; lastName: string } | null },
) {
  return {
    id: e.id,
    firstName: e.firstName,
    lastName: e.lastName,
    fullName: fullName(e),
    email: e.email,
    jobTitle: e.jobTitle,
    department: e.department,
    contractType: e.contractType,
    startDate: iso(e.startDate),
    endDate: iso(e.endDate),
    status: e.status,
    managerId: e.managerId,
    managerName: e.manager ? fullName(e.manager) : null,
    phone: e.phone,
    address: e.address,
    leave: {
      paidLeave: e.paidLeaveBalance,
      rtt: e.rttBalance,
      recovery: e.recoveryBalance,
    },
    ibanLast4: (() => {
      const iban = tryDecrypt(e.ibanEncrypted);
      return iban ? mask(iban).slice(-4) : null;
    })(),
    socialNumberSet: Boolean(e.socialNumberEncrypted),
  };
}

export function absenceDTO(
  a: Absence & { employee?: { firstName: string; lastName: string } | null },
) {
  return {
    id: a.id,
    employeeId: a.employeeId,
    employeeName: a.employee ? fullName(a.employee) : null,
    type: a.type,
    startDate: iso(a.startDate),
    endDate: iso(a.endDate),
    days: a.days,
    reason: a.reason,
    status: a.status,
    decidedAt: iso(a.decidedAt),
    createdAt: iso(a.createdAt),
  };
}

const num = (d: unknown) => Number(d);

export function invoiceDTO(
  inv: Invoice & { lines?: InvoiceLine[]; ppfHistory?: PpfEvent[] },
) {
  return {
    id: inv.id,
    number: inv.number,
    client: inv.clientName,
    clientSiren: inv.clientSiren,
    issueDate: iso(inv.issueDate),
    dueDate: iso(inv.dueDate),
    currency: inv.currency,
    totalExclVat: num(inv.totalExclVat),
    vatAmount: num(inv.vatAmount),
    totalInclVat: num(inv.totalInclVat),
    facturxProfile: inv.facturxProfile,
    facturxSha256: inv.facturxSha256,
    ppfStatus: inv.ppfStatus,
    ppfMessageId: inv.ppfMessageId,
    paid: Boolean(inv.paidAt),
    paidAt: iso(inv.paidAt),
    archivedUntil: iso(inv.archivedUntil),
    createdAt: iso(inv.createdAt),
    lines:
      inv.lines?.map((l) => ({
        label: l.label,
        quantity: num(l.quantity),
        unitPrice: num(l.unitPrice),
        vatRate: num(l.vatRate),
      })) ?? [],
    ppfHistory:
      inv.ppfHistory?.map((h) => ({
        status: h.status,
        detail: h.detail,
        occurredAt: iso(h.occurredAt),
      })) ?? [],
  };
}

export function shiftDTO(s: Shift & { employee?: { firstName: string; lastName: string } | null }) {
  return {
    id: s.id,
    employeeId: s.employeeId,
    employeeName: s.employee ? fullName(s.employee) : null,
    date: iso(s.date),
    startTime: s.startTime,
    endTime: s.endTime,
    location: s.location,
  };
}

export function payslipDTO(p: Payslip) {
  return {
    id: p.id,
    employeeId: p.employeeId,
    period: p.period,
    netAmount: num(p.netAmount),
    releasedAt: iso(p.releasedAt),
  };
}

export function documentDTO(doc: HrDocument) {
  return {
    id: doc.id,
    employeeId: doc.employeeId,
    title: doc.title,
    category: doc.category,
    generatedByAi: doc.generatedByAi,
    createdAt: iso(doc.createdAt),
  };
}

export function requestDTO(
  r: EmployeeRequest & { employee?: { firstName: string; lastName: string } | null },
) {
  return {
    id: r.id,
    employeeId: r.employeeId,
    employeeName: r.employee ? fullName(r.employee) : null,
    kind: r.kind,
    message: r.message,
    status: r.status,
    createdAt: iso(r.createdAt),
    resolvedAt: iso(r.resolvedAt),
  };
}
