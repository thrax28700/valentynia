import { Card, PageIntro, Badge, Progress, Button, Avatar } from '../../components/ui';
import { useReviewCampaigns, useUpcomingReviews } from '../../lib/api';
import { dateLong } from '../../lib/format';

export default function Reviews() {
  const { data: campaigns = [], isLoading } = useReviewCampaigns();
  const { data: upcoming = [] } = useUpcomingReviews();

  return (
    <div className="space-y-6">
      <PageIntro
        title="Entretiens annuels & professionnels"
        text="Campagnes, trames configurables et objectifs SMART, avec un historique pluriannuel consultable."
      />

      <div className="space-y-4">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
        ) : (
          campaigns.map((c) => (
            <Card key={c.id} className="flex flex-wrap items-center gap-6">
              <div className="min-w-52 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-heading text-sm font-medium text-prune">{c.name}</p>
                  <Badge tone={c.status === 'Clôturée' ? 'sage' : 'peach'}>{c.status}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-mauve">Échéance : {dateLong(c.deadline)}</p>
              </div>
              <div className="w-full max-w-xs">
                <Progress
                  label={`${c.done} / ${c.total} réalisés`}
                  value={c.total ? Math.round((c.done / c.total) * 100) : 0}
                />
              </div>
              <Button variant="ghost" icon="ArrowRight">
                Piloter
              </Button>
            </Card>
          ))
        )}
      </div>

      <Card>
        <h3 className="mb-4 text-lg">Prochains entretiens</h3>
        {upcoming.length === 0 ? (
          <p className="py-4 text-sm text-mauve">Aucun entretien planifié.</p>
        ) : (
          <ul className="divide-y divide-line">
            {upcoming.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={u.employeeName} size={34} />
                  <div>
                    <p className="font-heading text-sm text-prune">{u.employeeName}</p>
                    <p className="text-xs text-mauve">{u.campaign}</p>
                  </div>
                </div>
                <span className="font-mono text-sm text-mauve">{dateLong(u.scheduledAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
