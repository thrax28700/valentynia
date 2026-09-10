import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../lib/icons';
import { initials } from '../lib/format';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

/* ---------- Boutons ---------- */
type BtnProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
};
export function Button({ children, variant = 'primary', to, href, onClick, type = 'button', className, icon, loading, disabled }: BtnProps) {
  const cls = cx(
    variant === 'primary' && 'v-btn-primary',
    variant === 'secondary' && 'v-btn-secondary',
    variant === 'ghost' && 'v-btn-ghost',
    className,
  );
  const inner = (
    <>
      {loading ? <Spinner /> : icon && <IconEl name={icon} size={16} />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (href) return <a href={href} className={cls}>{inner}</a>;
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled || loading}>
      {inner}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx('h-4 w-4 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Carte ---------- */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('v-card p-6', className)}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, subtitle, center }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={cx('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && <p className="v-badge bg-rosewash text-powderdark mb-3">{eyebrow}</p>}
      <h2 className="text-3xl lg:text-4xl leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-mauve leading-relaxed">{subtitle}</p>}
    </div>
  );
}

/* ---------- Badge ---------- */
const tones: Record<string, string> = {
  powder: 'bg-rosewash text-powderdark', // accent rose
  rose: 'bg-rosewash text-powderdark',
  sage: 'bg-sage text-prune', // succès / validation
  neutral: 'bg-wash text-mauve border border-line',
  peach: 'bg-wash text-mauve border border-line', // (déprécié → neutre)
};
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: keyof typeof tones }) {
  return <span className={cx('v-badge', tones[tone] ?? tones.neutral)}>{children}</span>;
}

/* ---------- Icône enveloppée ---------- */
export function IconEl({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  const C = Icon[name];
  return <C size={size} className={className} />;
}

export function IconBubble({ name, tone = 'powder' }: { name: IconName; tone?: 'peach' | 'powder' | 'sage' }) {
  const bg: Record<string, string> = {
    powder: 'bg-rosewash text-powderdark',
    sage: 'bg-sage text-prune',
    peach: 'bg-wash text-mauve',
  };
  return (
    <span className={cx('flex h-10 w-10 items-center justify-center rounded-xl', bg[tone] ?? bg.powder)}>
      <IconEl name={name} size={19} />
    </span>
  );
}

/* ---------- Statistique ---------- */
export function Stat({ label, value, delta, tone }: { label: string; value: string; delta?: string; tone?: 'up' | 'down' }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="font-heading text-xs uppercase tracking-wide text-mauve">{label}</span>
      <span className="v-stat">{value}</span>
      {delta && (
        <span className={cx('font-heading text-xs', tone === 'down' ? 'text-powder' : 'text-mauve')}>
          {delta}
        </span>
      )}
    </Card>
  );
}

/* ---------- Barre de progression ---------- */
export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between font-heading text-xs text-mauve">
          <span>{label}</span>
          <span className="font-mono">{value}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-wash">
        <div
          className="h-full rounded-full bg-powder transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-wash font-heading font-medium text-mauve"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

/* ---------- Intro de page applicative ---------- */
export function PageIntro({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl">{title}</h1>
        {text && <p className="mt-1.5 text-sm leading-relaxed text-mauve">{text}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Tableau ---------- */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-mauve">
            {head.map((h) => (
              <th key={h} className="px-3 py-3 font-heading font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

/* ---------- Badge de statut (mapping centralisé) ---------- */
const STATUS_TONE: Record<string, keyof typeof tones> = {
  // absences
  'À valider': 'neutral', Validé: 'sage', Refusé: 'powder', Enregistré: 'neutral',
  // demandes salarié
  Traité: 'sage', Remboursé: 'sage', 'En cours': 'neutral',
  // PPF / factures
  Acceptée: 'sage', Encaissée: 'sage', 'Reçue par le PPF': 'neutral', Déposée: 'neutral',
  Brouillon: 'neutral', Rejetée: 'powder', Payée: 'sage', 'En attente': 'neutral',
  // salariés
  Actif: 'sage', Congé: 'neutral', Onboarding: 'powder', "Période d’essai": 'powder',
  // conformité
  Conforme: 'sage', Active: 'powder',
};
export const toneFor = (status: string): keyof typeof tones => STATUS_TONE[status] ?? 'neutral';
export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={toneFor(status)}>{status}</Badge>;
}

/* ---------- État vide ---------- */
export function EmptyState({ icon = 'Search', title, text }: { icon?: IconName; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <IconBubble name={icon} tone="peach" />
      <p className="mt-1 font-heading text-sm font-medium text-prune">{title}</p>
      {text && <p className="max-w-xs text-xs text-mauve">{text}</p>}
    </div>
  );
}

/* ---------- Champ de formulaire ---------- */
type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  className?: string;
};
export function Field({ label, value, onChange, type = 'text', required, placeholder, options, className }: FieldProps) {
  return (
    <label className={cx('block', className)}>
      <span className="v-label">{label}</span>
      {options ? (
        <select className="v-input" value={value} required={required} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          className="v-input"
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

/* ---------- Fenêtre modale ---------- */
export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-prune/30 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-white shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-base">{title}</h3>
          <button className="v-btn-ghost !p-2" onClick={onClose} aria-label="Fermer">
            <IconEl name="Close" size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Hook : action asynchrone (chargement + erreur) ---------- */
export function useAsync<A extends unknown[]>(fn: (...args: A) => Promise<unknown>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(
    async (...args: A) => {
      setLoading(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Une erreur est survenue');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [fn],
  );
  return { run, loading, error };
}
