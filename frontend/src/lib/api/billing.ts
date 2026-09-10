import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../http';
import type { Invoice, InvoiceLine, VatJournalEntry } from './types';

export const invoicesKey = ['billing', 'invoices'] as const;

export function useInvoices() {
  return useQuery({
    queryKey: invoicesKey,
    queryFn: ({ signal }) => api<Invoice[]>('/billing/invoices', { signal }),
  });
}

export function useVatJournal() {
  return useQuery({
    queryKey: ['billing', 'vat-journal'],
    queryFn: ({ signal }) => api<VatJournalEntry[]>('/billing/vat-journal', { signal }),
  });
}

export function useVatJournalVerify() {
  return useQuery({
    queryKey: ['billing', 'vat-journal', 'verify'],
    queryFn: ({ signal }) =>
      api<{ ok: boolean; brokenAt?: number }>('/billing/vat-journal/verify', { signal }),
  });
}

export type NewInvoice = {
  clientName: string;
  clientSiren?: string;
  issueDate: string;
  dueDate: string;
  currency?: string;
  lines: InvoiceLine[];
};

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewInvoice) =>
      api<{ invoice: Invoice; facturxXml: string }>('/billing/invoices', { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoicesKey });
      qc.invalidateQueries({ queryKey: ['billing', 'vat-journal'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSendToPpf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ invoice: Invoice; simulated: boolean }>(`/billing/invoices/${id}/send-ppf`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoicesKey });
      qc.invalidateQueries({ queryKey: ['billing', 'vat-journal'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/** Récupère le XML Factur-X d'une facture (texte brut). */
export function fetchFacturxXml(id: string) {
  return api<string>(`/billing/invoices/${id}/facturx.xml`, { raw: true });
}
