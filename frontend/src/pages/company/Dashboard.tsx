import { Card, Stat, PageIntro, Badge, StatusBadge, IconEl, IconBubble, Progress, Button, cx } from '../../components/ui';
import { useStore } from '../../lib/store';
import { eur, dateShort } from '../../lib/format';

const toneRing: Record<string, string> = {
  powder: 'border-powder/30 bg-rosewash',
  peach: 'border-line bg-wash',
  sage: 'border-line bg-wash',
};

export default function Dashboard() {
  const employees = useStore((d) => d.employees);
  const absences = useStore((d) => d.absences);
  const invoices = useStore((d) => d.invoices);
  const insights = useStore((d) => d.insights);
  const alerts = useStore((d) => d.alerts);
  const activity = useStore((d) => d.activity);

  const pending = absences.filter((a) => a.status === 'À valider');
  const openAlerts = alerts.filter((a) => !a.resolved);
  const ppfPending = invoices.filter((i) => !['Acceptée', 'Encaissée'].includes(i.ppf)).length;
  const outstanding = invoices.filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0);
  const score = Math.max(0, Math.min(100, 100 - openAlerts.length * 4));

  const stats = [
    { label: 'Effectif', value: String(employees.length), delta: `${employees.filter((e) => e.status === 'Onboarding').length} en intégration` },
    { label: 'Absences à valider', value: String(pending.length), delta: 'File de validation', tone: pending.length ? ('down' as const) : undefined },
    { label: 'Encours client', value: eur.format(outstanding), delta: `${invoices.filter((i) => !i.paid).length} factures ouvertes` },
    { label: 'Factures hors PPF final', value: String(ppfPending), delta: 'À transmettre / suivre', tone: ppfPending ? ('down' as const) : undefined },
  ];

  return (
    <div className="space-y-8">
      <PageIntro title="Vue globale RH" text="Effectif, climat, facturation et conformité — mis à jour en direct avec vos actions." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} delta={s.delta} tone={s.tone} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Recommandations de l'assistant IA</h3>
            <Badge tone="powder">{insights.length}</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {insights.map((i) => (
              <div key={i.id} className={cx('rounded-xl border p-4', toneRing[i.tone] ?? 'border-line bg-wash')}>
                <p className="flex items-center gap-2 font-heading text-sm font-medium text-prune">
                  <IconEl name="Sparkle" size={15} className="text-powder" />
                  {i.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-mauve">{i.text}</p>
              </div>
            ))}
          </div>
          <Button to="/app/ia" variant="ghost" className="mt-4" icon="ArrowRight">Ouvrir l'assistant</Button>
        </Card>

        <Card>
          <h3 className="text-lg">Conformité</h3>
          <p className="v-stat mt-2">{score} %</p>
          <p className="mt-1 text-xs text-mauve">{openAlerts.length} alerte(s) ouverte(s)</p>
          <div className="mt-5 space-y-3">
            <Progress label="Contrats vérifiés" value={92} />
            <Progress label="Obligations RH" value={88} />
            <Progress label="Registre RGPD" value={82} />
          </div>
          <Button to="/app/conformite" variant="ghost" className="mt-5" icon="ArrowRight">Voir le détail</Button>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Absences à valider</h3>
            <IconBubble name="Calendar" tone="sage" />
          </div>
          {pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-mauve">Rien à valider. 🌿</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {pending.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-heading text-sm text-prune">{a.who}</p>
                    <p className="text-xs text-mauve">{a.type} · {dateShort(a.from)} → {dateShort(a.to)} · {a.days} j</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
          <Button to="/app/absences" variant="ghost" className="mt-3" icon="ArrowRight">Toutes les demandes</Button>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Facturation — suivi PPF</h3>
            <IconBubble name="Receipt" tone="powder" />
          </div>
          <ul className="mt-4 divide-y divide-line">
            {invoices.slice(0, 5).map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-mono text-sm text-prune">{inv.id}</p>
                  <p className="text-xs text-mauve">{inv.client} · {eur.format(inv.amount)}</p>
                </div>
                <StatusBadge status={inv.ppf} />
              </li>
            ))}
          </ul>
          <Button to="/app/facturation" variant="ghost" className="mt-3" icon="ArrowRight">Ouvrir la facturation</Button>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg">Activité récente</h3>
        <ul className="mt-3 space-y-2 text-sm text-mauve">
          {activity.slice(0, 6).map((a) => (
            <li key={a.id} className="flex gap-2">
              <span className="font-mono text-xs text-mauve/70">{new Date(a.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              {a.text}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
