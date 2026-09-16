import type { ReactNode } from 'react';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="v-container max-w-3xl py-16">
      <p className="text-xs uppercase tracking-wide text-mauve">Mis à jour le {updated}</p>
      <h1 className="mt-2 text-3xl">{title}</h1>
      <div className="mt-10 space-y-8">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-mauve">{children}</div>
    </section>
  );
}
