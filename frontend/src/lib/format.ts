export const eur = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const eur2 = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

export const num = new Intl.NumberFormat('fr-FR');

export const pct = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(v);

export const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Nombre de jours ouvrés (lun-ven) entre deux dates ISO incluses. */
export function businessDays(fromISO: string, toISO: string): number {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  if (Number.isNaN(+from) || Number.isNaN(+to) || to < from) return 1;
  let n = 0;
  for (const c = new Date(from); c <= to; c.setDate(c.getDate() + 1)) {
    const day = c.getDay();
    if (day !== 0 && day !== 6) n++;
  }
  return n || 1;
}

/** Heure courte (HH:MM) d'une date ISO. */
export const timeShort = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
