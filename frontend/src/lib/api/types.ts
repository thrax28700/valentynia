import type { Role } from '../roles';

export type { Role };

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: Role;
  companyId: string;
  employeeId: string | null;
};

export type Session = {
  user: SessionUser;
  company: { id: string; name: string; siren: string; plan: string };
  employee: { id: string; jobTitle: string; department: string } | null;
};

export type ContractType = 'CDI' | 'CDD' | 'ALTERNANCE' | 'STAGE' | 'INTERIM';
export type EmployeeStatus =
  | 'ACTIVE'
  | 'ONBOARDING'
  | 'PROBATION'
  | 'ON_LEAVE'
  | 'OFFBOARDING'
  | 'LEFT';

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  contractType: ContractType;
  startDate: string;
  endDate: string | null;
  status: EmployeeStatus;
  managerId: string | null;
  managerName: string | null;
  phone: string | null;
  address: string | null;
  leave: { paidLeave: number; rtt: number; recovery: number };
  ibanLast4: string | null;
  socialNumberSet: boolean;
};

export type AbsenceType = 'PAID_LEAVE' | 'RTT' | 'SICK' | 'UNPAID' | 'FAMILY' | 'OTHER';
export type AbsenceStatus = 'PENDING' | 'APPROVED' | 'REFUSED' | 'RECORDED';

export type Absence = {
  id: string;
  employeeId: string;
  employeeName: string | null;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: AbsenceStatus;
  decidedAt: string | null;
  createdAt: string;
};

export type Shift = {
  id: string;
  employeeId: string;
  employeeName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
};

export type Payslip = {
  id: string;
  employeeId: string;
  period: string;
  netAmount: number;
  releasedAt: string;
};

export type HrDocument = {
  id: string;
  employeeId: string | null;
  title: string;
  category: string;
  generatedByAi: boolean;
  createdAt: string;
};

export type DocumentTemplate = {
  id: string;
  name: string;
  category: string;
  uses: number;
  updatedAt: string;
};

export type UpcomingReview = {
  id: string;
  employeeName: string;
  campaign: string;
  type: string;
  scheduledAt: string;
};

export type ReviewCampaign = {
  id: string;
  name: string;
  type: string;
  deadline: string;
  total: number;
  done: number;
  status: string;
};

export type Skill = { id: string; name: string };
export type SkillMatrixRow = { id: string; name: string; levels: Record<string, number> };
export type SkillsPayload = { skills: Skill[]; matrix: SkillMatrixRow[] };

export type DevelopmentPlan = {
  id: string;
  employeeName: string;
  goal: string;
  progress: number;
  status: string;
};

export type JourneyKind = 'ONBOARDING' | 'OFFBOARDING';
export type OnboardingTask = { id: string; label: string; done: boolean };
export type OnboardingJourney = {
  id: string;
  kind: JourneyKind;
  employeeName: string;
  jobTitle: string;
  startDate: string;
  progress: number;
  tasks: OnboardingTask[];
};

export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'REFUSED' | 'REIMBURSED';
export type EmployeeRequest = {
  id: string;
  employeeId: string;
  employeeName: string | null;
  kind: string;
  message: string | null;
  status: RequestStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export type PpfStatus =
  | 'DRAFT'
  | 'DEPOSITED'
  | 'RECEIVED_BY_PPF'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'DISPUTED'
  | 'PAID';

export type InvoiceLine = { label: string; quantity: number; unitPrice: number; vatRate: number };

export type Invoice = {
  id: string;
  number: string;
  client: string;
  clientSiren: string | null;
  issueDate: string;
  dueDate: string;
  currency: string;
  totalExclVat: number;
  vatAmount: number;
  totalInclVat: number;
  facturxProfile: string;
  facturxSha256: string | null;
  ppfStatus: PpfStatus;
  ppfMessageId: string | null;
  paid: boolean;
  paidAt: string | null;
  archivedUntil: string | null;
  createdAt: string;
  lines: InvoiceLine[];
  ppfHistory: { status: PpfStatus; detail: string | null; occurredAt: string }[];
};

export type VatJournalEntry = {
  id: string;
  sequence: number;
  event: string;
  payloadHash: string;
  previousHash: string;
  entryHash: string;
  createdAt: string;
};

export type AlertLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type LegalAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  dueDate: string | null;
  resolved?: boolean;
  createdAt?: string;
};

export type AiInsight = {
  id: string;
  kind: string;
  title: string;
  body: string;
  severity: AlertLevel;
};

export type ActivityEntry = { id: string; text: string; createdAt: string };

export type Company = {
  id: string;
  name: string;
  siren: string;
  address: string | null;
  collectiveAgreement: string | null;
  weeklyHours: number;
  plan: string;
  headcount: number;
};

export type DashboardData = {
  headcount: number;
  onboardingCount: number;
  pendingAbsences: number;
  openAlerts: number;
  outstandingAmount: number;
  openInvoices: number;
  ppfPending: number;
  complianceScore: number;
  insights: AiInsight[];
  alerts: LegalAlert[];
  recentAbsences: Absence[];
  recentInvoices: Invoice[];
  activity: ActivityEntry[];
};
