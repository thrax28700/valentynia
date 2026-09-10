import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../http';
import type { DashboardData, Company, LegalAlert, AiInsight, ActivityEntry } from './types';

/* ---------------------------------------------------------------- Tableau de bord */

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => api<DashboardData>('/dashboard', { signal }),
  });
}

/* ---------------------------------------------------------------- Entreprise */

export function useCompany() {
  return useQuery({
    queryKey: ['company'],
    queryFn: ({ signal }) => api<Company>('/company', { signal }),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Pick<Company, 'name' | 'siren' | 'address' | 'collectiveAgreement' | 'weeklyHours' | 'plan'>>) =>
      api<Company>('/company', { method: 'PATCH', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company'] }),
  });
}

export function useActivity(limit = 40) {
  return useQuery({
    queryKey: ['company', 'activity', limit],
    queryFn: ({ signal }) => api<ActivityEntry[]>(`/company/activity?limit=${limit}`, { signal }),
  });
}

/* ---------------------------------------------------------------- Conformité */

export function useLegalAlerts() {
  return useQuery({
    queryKey: ['compliance', 'alerts'],
    queryFn: ({ signal }) => api<LegalAlert[]>('/compliance/alerts', { signal }),
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/compliance/alerts/${id}/resolve`, { method: 'PATCH', body: {} }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compliance', 'alerts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export type ContractCheck = { contractType: string; compliant: boolean; missingClauses: string[] };

export function useCheckContract() {
  return useMutation({
    mutationFn: (body: { contractType: 'CDI' | 'CDD'; text: string }) =>
      api<ContractCheck>('/compliance/contracts/check', { body }),
  });
}

/* ---------------------------------------------------------------- Assistant IA */

export function useAiInsights() {
  return useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: ({ signal }) => api<AiInsight[]>('/ai/insights', { signal }),
  });
}

export function useAiChat() {
  return useMutation({
    mutationFn: (message: string) =>
      api<{ reply: string; tone: string; disclaimer: string }>('/ai/chat', { body: { message } }),
  });
}

export function useGenerateDocument() {
  return useMutation({
    mutationFn: (body: { template: string; values: Record<string, string>; employeeId?: string }) =>
      api<{ template: string; content: string }>('/ai/documents/generate', { body }),
  });
}
