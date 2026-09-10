import {
  Card,
  Stat,
  PageIntro,
  Badge,
  StatusBadge,
  IconEl,
  IconBubble,
  Progress,
  Button,
  cx,
} from '../../components/ui';
import { useDashboard } from '../../lib/api';
import { eur, dateShort, timeShort } from '../../lib/format';
import { absenceStatusLabel, absenceTypeLabel, ppfStatusLabel } from '../../lib/labels';

const severityRing: Record<string, string> = {
  HIGH: 'border-powder/30 bg-rosewash',
  MEDIUM: 'border-line bg-wash',
  LOW: 'border-line bg-wash',
};

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-mauve">Chargement du tableau de bord…</p>;
  }
  if (isError || !data) {
    return <p className="py-16 text-center text-sm text-powderdark">Tableau de bord indisponible.</p>;
  }

  const stats = [
    {
      label: 'Effectif',
      value: String(data.headcount),
      delta: `${data.onboardingCount} en intégration`,
    },
    {
      label: 'Absences à valider',
      value: String(data.pendingAbsences),
      delta: 'File de validation',
      tone: data.pendingAbsences ? ('down' as const) : undefined,
    },
    {
      label: 'Encours client',
      value: eur.format(data.outstandingAmount),
      delta: `${data.openInvoices} factures ouvertes`,
    },
    {
      label: 'Factures hors PPF final',
      value: String(data.ppfPending),
      delta: 'À transmettre / suivre',
      tone: data.ppfPending ? ('down' as const) : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      <PageIntro
        title="Vue globale RH"
        text="Effectif, climat, facturation et conformité — mis à jour en direct avec vos actions."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} delta={s.delta} tone={s.tone} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Recommandations de l'assistant IA</h3>
            <Badge tone="powder">{data.insights.length}</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {data.insights.map((i) => (
              <div
                key={i.id}
                className={cx('rounded-xl border p-4', severityRing[i.severity] ?? 'border-line bg-wash')}
              >
                <p className="flex items-center gap-2 font-heading text-sm font-medium text-prune">
                  <IconEl name="Sparkle" size={15} className="text-powder" />
                  {i.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-mauve">{i.body}</p>
              </div>
            ))}
          </div>
          <Button to="/app/ia" variant="ghost" className="mt-4" icon="ArrowRight">
            Ouvrir l'assistant
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg">Conformité</h3>
          <p className="v-stat mt-2">{data.complianceScore} %</p>
          <p className="mt-1 text-xs text-mauve">{data.openAlerts} alerte(s) ouverte(s)</p>
          <div className="mt-5 space-y-3">
            <Progress label="Contrats vérifiés" value={92} />
            <Progress label="Obligations RH" value={88} />
            <Progress label="Registre RGPD" value={82} />
          </div>
          <Button to="/app/conformite" variant="ghost" className="mt-5" icon="ArrowRight">
            Voir le détail
          </Button>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Absences à valider</h3>
            <IconBubble name="Calendar" tone="sage" />
          </div>
          {data.recentAbsences.length === 0 ? (
            <p className="py-8 text-center text-sm text-mauve">Rien à valider. 🌿</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {data.recentAbsences.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-heading text-sm text-prune">{a.employeeName}</p>
                    <p className="text-xs text-mauve">
                      {absenceTypeLabel[a.type] ?? a.type} · {dateShort(a.startDate)} →{' '}
                      {dateShort(a.endDate)} · {a.days} j
                    </p>
                  </div>
                  <StatusBadge status={absenceStatusLabel[a.status] ?? a.status} />
                </li>
              ))}
            </ul>
          )}
          <Button to="/app/absences" variant="ghost" className="mt-3" icon="ArrowRight">
            Toutes les demandes
          </Button>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Facturation — suivi PPF</h3>
            <IconBubble name="Receipt" tone="powder" />
          </div>
          <ul className="mt-4 divide-y divide-line">
            {data.recentInvoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-mono text-sm text-prune">{inv.number}</p>
                  <p className="text-xs text-mauve">
                    {inv.client} · {eur.format(inv.totalInclVat)}
                  </p>
                </div>
                <StatusBadge status={ppfStatusLabel[inv.ppfStatus] ?? inv.ppfStatus} />
              </li>
            ))}
          </ul>
          <Button to="/app/facturation" variant="ghost" className="mt-3" icon="ArrowRight">
            Ouvrir la facturation
          </Button>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg">Activité récente</h3>
        <ul className="mt-3 space-y-2 text-sm text-mauve">
          {data.activity.map((a) => (
            <li key={a.id} className="flex gap-2">
              <span className="font-mono text-xs text-mauve/70">{timeShort(a.createdAt)}</span>
              {a.text}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
