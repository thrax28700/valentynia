import { useState } from 'react';
import { Card, PageIntro, Badge, Progress, Button, IconEl, IconBubble, EmptyState, Field, useAsync, cx } from '../../components/ui';
import { useStore } from '../../lib/store';
import { compliance } from '../../lib/api';
import { complianceItems } from '../../data/mock';
import { dateShort } from '../../lib/format';

const levelText: Record<string, string> = { high: 'text-powderdark', medium: 'text-powder', low: 'text-mauve' };
const levelBadge: Record<string, 'powder' | 'peach' | 'sage'> = { high: 'powder', medium: 'peach', low: 'sage' };

export default function Compliance() {
  const alerts = useStore((d) => d.alerts);
  const resolve = useAsync(compliance.resolveAlert);
  const open = alerts.filter((a) => !a.resolved);
  const score = Math.round(100 - open.length * 4 - open.filter((a) => a.level === 'high').length * 6);

  const [ctype, setCtype] = useState<'CDI' | 'CDD'>('CDI');
  const [ctext, setCtext] = useState('');
  const [result, setResult] = useState<{ compliant: boolean; missing: string[] } | null>(null);

  return (
    <div className="space-y-6">
      <PageIntro title="Conformité légale" text="Alertes réglementaires, obligations RH, RGPD et vérification des contrats." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <h3 className="text-lg">Indice de conformité</h3>
          <p className="v-stat mt-2">{Math.max(0, Math.min(100, score))} %</p>
          <p className="text-xs text-mauve">{open.length} action(s) ouverte(s)</p>
          <div className="mt-5 space-y-3">
            <Progress label="Contrats" value={92} />
            <Progress label="Obligations RH" value={88} />
            <Progress label="RGPD" value={82} />
            <Progress label="Affichages & registres" value={100} />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg">Alertes légales</h3>
          {open.length === 0 ? (
            <EmptyState icon="Check" title="Tout est à jour" text="Aucune alerte de conformité en cours." />
          ) : (
            <ul className="space-y-3">
              {open.map((a) => (
                <li key={a.id} className="flex gap-3 rounded-xl bg-wash p-4">
                  <IconEl name="Bell" size={18} className={cx('mt-0.5 shrink-0', levelText[a.level])} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-sm text-prune">{a.title}</p>
                      <Badge tone={levelBadge[a.level]}>Échéance {dateShort(a.due)}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-mauve">{a.detail}</p>
                  </div>
                  <button className="v-btn-ghost !px-2 !py-1.5 text-xs" disabled={resolve.loading} onClick={() => resolve.run(a.id)}>
                    <IconEl name="Check" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-lg">Vérification automatique d'un contrat</h3>
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <Field label="Type" value={ctype} onChange={(v) => setCtype(v as 'CDI' | 'CDD')} options={[{ value: 'CDI', label: 'CDI' }, { value: 'CDD', label: 'CDD' }]} />
          <label className="block">
            <span className="v-label">Texte du contrat</span>
            <textarea className="v-input" rows={4} value={ctext} onChange={(e) => setCtext(e.target.value)} placeholder="Collez ici les clauses du contrat…" />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button variant="secondary" icon="Shield" onClick={() => setResult(compliance.checkContract(ctype, ctext))}>Analyser</Button>
          {result && (
            <span className={cx('text-sm', result.compliant ? 'text-prune' : 'text-powderdark')}>
              {result.compliant ? '✓ Toutes les clauses obligatoires sont présentes.' : `${result.missing.length} clause(s) manquante(s) : ${result.missing.join(', ')}`}
            </span>
          )}
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        {complianceItems.map((c) => (
          <Card key={c.title}>
            <IconBubble name={c.icon} tone="sage" />
            <h3 className="mt-4 text-base">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mauve">{c.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
