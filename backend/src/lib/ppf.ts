import { env } from '../config/env';

/**
 * Client du Portail Public de Facturation (PPF).
 *
 * Tant que `PPF_API_BASE_URL` / `PPF_API_TOKEN` ne sont pas renseignés,
 * le client fonctionne en mode simulation : il fait avancer le cycle de vie
 * de la facture sans appel réseau, pour permettre le développement local.
 */

export type PpfLifecycle =
  | 'DEPOSITED'
  | 'RECEIVED_BY_PPF'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'DISPUTED'
  | 'PAID';

export type PpfSubmitResult = {
  messageId: string;
  status: PpfLifecycle;
  detail: string;
  simulated: boolean;
};

const isLive = () => Boolean(env.PPF_API_BASE_URL && env.PPF_API_TOKEN);

export async function submitInvoice(params: {
  number: string;
  facturxXml: string;
  buyerSiren?: string;
}): Promise<PpfSubmitResult> {
  if (!isLive()) {
    return {
      messageId: `SIM-${Date.now()}-${params.number}`,
      status: 'RECEIVED_BY_PPF',
      detail: 'Mode simulation : facture acceptée par le PPF fictif.',
      simulated: true,
    };
  }

  const res = await fetch(`${env.PPF_API_BASE_URL}/invoices`, {
    method: 'POST',
    headers: {
      'content-type': 'application/xml',
      authorization: `Bearer ${env.PPF_API_TOKEN}`,
      'x-emitter-siren': env.PPF_SIREN_EMETTEUR ?? '',
    },
    body: params.facturxXml,
  });

  if (!res.ok) {
    return {
      messageId: '',
      status: 'REJECTED',
      detail: `PPF a répondu ${res.status} : ${await res.text()}`,
      simulated: false,
    };
  }

  const data = (await res.json()) as { messageId: string; status: PpfLifecycle };
  return { messageId: data.messageId, status: data.status, detail: 'Transmise au PPF.', simulated: false };
}

export async function fetchStatus(messageId: string): Promise<{ status: PpfLifecycle; detail: string }> {
  if (!isLive() || messageId.startsWith('SIM-')) {
    return { status: 'ACCEPTED', detail: 'Mode simulation : facture mise à disposition du destinataire.' };
  }
  const res = await fetch(`${env.PPF_API_BASE_URL}/invoices/${messageId}/status`, {
    headers: { authorization: `Bearer ${env.PPF_API_TOKEN}` },
  });
  const data = (await res.json()) as { status: PpfLifecycle; detail?: string };
  return { status: data.status, detail: data.detail ?? '' };
}
