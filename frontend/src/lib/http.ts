/**
 * Client HTTP de l'API Valentynia.
 *
 * - Base : `VITE_API_URL` si défini (déploiement), sinon `/api` (proxy Vite en dev).
 * - Jeton JWT ajouté automatiquement depuis le localStorage.
 * - Les réponses non-2xx sont levées sous forme d'`ApiError` (message serveur).
 */

const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
export const TOKEN_KEY = 'valentynia:token';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* mode privé : la session vivra en mémoire le temps de l'onglet */
  }
  // Notifie le contexte d'authentification (même onglet).
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('valentynia:auth'));
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  /** Renvoyer le texte brut (ex. téléchargement XML) plutôt que du JSON. */
  raw?: boolean;
};

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (opts.raw) {
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return (await res.text()) as T;
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && String((data as { error: unknown }).error)) ||
      `Erreur ${res.status}`;
    if (res.status === 401) setToken(null);
    throw new ApiError(res.status, message, (data as { details?: unknown } | null)?.details);
  }

  return data as T;
}

export const get = <T>(path: string, signal?: AbortSignal) => api<T>(path, { method: 'GET', signal });
export const post = <T>(path: string, body?: unknown) => api<T>(path, { method: 'POST', body });
export const patch = <T>(path: string, body?: unknown) => api<T>(path, { method: 'PATCH', body });
export const del = <T>(path: string) => api<T>(path, { method: 'DELETE' });
