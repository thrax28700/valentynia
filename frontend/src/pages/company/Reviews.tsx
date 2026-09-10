import { Card, PageIntro, Badge, Progress, Button, Avatar } from '../../components/ui';

const campaigns = [
  { name: 'Entretiens annuels 2026', done: 98, total: 142, deadline: '30 novembre 2026', status: 'En cours' },
  { name: 'Entretiens professionnels (2 ans)', done: 12, total: 18, deadline: '15 octobre 2026', status: 'En cours' },
  { name: 'Point mi-année — managers', done: 24, total: 24, deadline: '30 juin 2026', status: 'Clôturée' },
];

const upcoming = [
  { who: 'Yanis Moreau', date: '12 sept.', type: 'Entretien annuel' },
  { who: 'Sofia Renault', date: '15 sept.', type: 'Entretien professionnel' },
  { who: 'Aïcha Diallo', date: '18 sept.', type: 'Entretien annuel' },
];

export default function Reviews() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Entretiens annuels & professionnels"
        text="Campagnes, trames configurables et objectifs SMART, avec un historique pluriannuel consultable."
        action={<Button icon="Plus">Nouvelle campagne</Button>}
      />

      <div className="space-y-4">
        {campaigns.map((c) => (
          <Card key={c.name} className="flex flex-wrap items-center gap-6">
            <div className="min-w-52 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-heading text-sm font-medium text-prune">{c.name}</p>
                <Badge tone={c.status === 'Clôturée' ? 'sage' : 'peach'}>{c.status}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-mauve">Échéance : {c.deadline}</p>
            </div>
            <div className="w-full max-w-xs">
              <Progress label={`${c.done} / ${c.total} réalisés`} value={Math.round((c.done / c.total) * 100)} />
            </div>
            <Button variant="ghost" icon="ArrowRight">Piloter</Button>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 text-lg">Prochains entretiens</h3>
        <ul className="divide-y divide-line">
          {upcoming.map((u) => (
            <li key={u.who} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Avatar name={u.who} size={34} />
                <div>
                  <p className="font-heading text-sm text-prune">{u.who}</p>
                  <p className="text-xs text-mauve">{u.type}</p>
                </div>
              </div>
              <span className="font-mono text-sm text-mauve">{u.date}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
