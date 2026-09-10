import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../http';
import type {
  Employee,
  Absence,
  AbsenceType,
  Shift,
  Payslip,
  HrDocument,
  DocumentTemplate,
  UpcomingReview,
  ReviewCampaign,
  SkillsPayload,
  DevelopmentPlan,
  OnboardingJourney,
  JourneyKind,
  EmployeeRequest,
  RequestStatus,
} from './types';

const qs = (params: Record<string, string | boolean | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === false) continue;
    p.set(k, v === true ? '1' : v);
  }
  const s = p.toString();
  return s ? `?${s}` : '';
};

/* ---------------------------------------------------------------- Salariés */

export const employeesKey = ['hr', 'employees'] as const;

export function useEmployees() {
  return useQuery({
    queryKey: employeesKey,
    queryFn: ({ signal }) => api<Employee[]>('/hr/employees', { signal }),
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['hr', 'employees', id],
    queryFn: ({ signal }) => api<Employee>(`/hr/employees/${id}`, { signal }),
    enabled: Boolean(id),
  });
}

export type NewEmployee = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  contractType: string;
  startDate: string;
  managerId?: string;
};

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewEmployee) => api<Employee>('/hr/employees', { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeesKey });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateEmployeeContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; phone?: string; address?: string }) =>
      api<Employee>(`/hr/employees/${id}/contact`, { method: 'PATCH', body }),
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: employeesKey });
      qc.invalidateQueries({ queryKey: ['hr', 'employees', e.id] });
    },
  });
}

/* ---------------------------------------------------------------- Absences */

export function useAbsences(opts: { mine?: boolean; status?: string } = {}) {
  return useQuery({
    queryKey: ['hr', 'absences', opts],
    queryFn: ({ signal }) =>
      api<Absence[]>(`/hr/absences${qs({ mine: opts.mine, status: opts.status })}`, { signal }),
  });
}

export type NewAbsence = {
  employeeId?: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  reason?: string;
};

export function useCreateAbsence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewAbsence) => api<Absence>('/hr/absences', { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'absences'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDecideAbsence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REFUSED' }) =>
      api<Absence>(`/hr/absences/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'absences'] });
      qc.invalidateQueries({ queryKey: employeesKey });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/* ---------------------------------------------------------------- Plannings */

export function useShifts(opts: { mine?: boolean; from?: string } = {}) {
  return useQuery({
    queryKey: ['hr', 'shifts', opts],
    queryFn: ({ signal }) =>
      api<Shift[]>(`/hr/shifts${qs({ mine: opts.mine, from: opts.from })}`, { signal }),
  });
}

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      employeeId: string;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
    }) => api<Shift>('/hr/shifts', { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'shifts'] }),
  });
}

/* ---------------------------------------------------------------- Bulletins */

export function usePayslips(opts: { mine?: boolean } = {}) {
  return useQuery({
    queryKey: ['hr', 'payslips', opts],
    queryFn: ({ signal }) => api<Payslip[]>(`/hr/payslips${qs({ mine: opts.mine })}`, { signal }),
  });
}

/* ---------------------------------------------------------------- Documents */

export function useDocuments(opts: { mine?: boolean } = {}) {
  return useQuery({
    queryKey: ['hr', 'documents', opts],
    queryFn: ({ signal }) => api<HrDocument[]>(`/hr/documents${qs({ mine: opts.mine })}`, { signal }),
  });
}

export function useDocumentTemplates() {
  return useQuery({
    queryKey: ['hr', 'document-templates'],
    queryFn: ({ signal }) => api<DocumentTemplate[]>('/hr/document-templates', { signal }),
  });
}

/* ---------------------------------------------------------------- Entretiens */

export function useUpcomingReviews() {
  return useQuery({
    queryKey: ['hr', 'reviews'],
    queryFn: ({ signal }) => api<UpcomingReview[]>('/hr/reviews', { signal }),
  });
}

export function useReviewCampaigns() {
  return useQuery({
    queryKey: ['hr', 'review-campaigns'],
    queryFn: ({ signal }) => api<ReviewCampaign[]>('/hr/review-campaigns', { signal }),
  });
}

export function useCreateReviewCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; type: string; deadline: string; total?: number }) =>
      api<ReviewCampaign>('/hr/review-campaigns', { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'review-campaigns'] }),
  });
}

/* ---------------------------------------------------------------- Compétences */

export function useSkills() {
  return useQuery({
    queryKey: ['hr', 'skills'],
    queryFn: ({ signal }) => api<SkillsPayload>('/hr/skills', { signal }),
  });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api('/hr/skills', { body: { name } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'skills'] }),
  });
}

export function useSetEmployeeSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { employeeId: string; skillId: string; level: number }) =>
      api('/hr/employee-skills', { method: 'PUT', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'skills'] }),
  });
}

export function useDevelopmentPlans() {
  return useQuery({
    queryKey: ['hr', 'development-plans'],
    queryFn: ({ signal }) => api<DevelopmentPlan[]>('/hr/development-plans', { signal }),
  });
}

/* ---------------------------------------------------------------- Onboarding */

export function useOnboarding(kind?: JourneyKind) {
  return useQuery({
    queryKey: ['hr', 'onboarding', kind ?? 'all'],
    queryFn: ({ signal }) =>
      api<OnboardingJourney[]>(`/hr/onboarding${qs({ kind })}`, { signal }),
  });
}

export function useCreateJourney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { employeeId: string; kind: JourneyKind; startDate: string }) =>
      api<OnboardingJourney>('/hr/onboarding', { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'onboarding'] });
      qc.invalidateQueries({ queryKey: employeesKey });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useToggleOnboardingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      api(`/hr/onboarding/tasks/${id}`, { method: 'PATCH', body: { done } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'onboarding'] }),
  });
}

/* ---------------------------------------------------------------- Demandes salarié */

export function useRequests(opts: { mine?: boolean } = {}) {
  return useQuery({
    queryKey: ['hr', 'requests', opts],
    queryFn: ({ signal }) =>
      api<EmployeeRequest[]>(`/hr/requests${qs({ mine: opts.mine })}`, { signal }),
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { kind: string; message?: string }) =>
      api<EmployeeRequest>('/hr/requests', { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'requests'] }),
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      api<EmployeeRequest>(`/hr/requests/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'requests'] }),
  });
}
