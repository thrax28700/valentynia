import { Card, PageIntro, Badge, Progress, Avatar, Button, IconEl } from '../../components/ui';

const onboarding = [
  {
    who: 'Thomas Lefèvre',
    role: 'Designer — arrivée le 3 février',
    progress: 62,
    tasks: [
      { label: 'Contrat signé électroniquement', done: true },
      { label: 'Compte e-mail & accès créés', done: true },
      { label: 'Matériel attribué (ordinateur, badge)', done: true },
      { label: 'Parcours de formation sécurité', done: false },
      { label: 'Rendez-vous manager J+7', done: false },
    ],
  },
  {
    who: 'Léa Nguyen',
    role: 'Alternante RH — arrivée le 15 septembre',
    progress: 20,
    tasks: [
      { label: 'Promesse d’embauche envoyée', done: true },
      { label: 'Convention de stage / alternance', done: false },
      { label: 'DPAE effectuée', done: false },
      { label: 'Kit de bienvenue préparé', done: false },
    ],
  },
];

const offboarding = [
  { who: 'Marc Bonnet', role: 'Départ retraite — 31 décembre', progress: 35 },
];

export default function Onboarding() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Onboarding & offboarding"
        text="Parcours d’intégration et de départ guidés : checklists automatisées, matériel et signatures."
        action={<Button icon="Plus">Lancer un parcours</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {onboarding.map((p) => (
          <Card key={p.who}>
            <div className="flex items-center gap-3">
              <Avatar name={p.who} />
              <div>
                <p className="font-heading text-sm font-medium text-prune">{p.who}</p>
                <p className="text-xs text-mauve">{p.role}</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress label="Progression" value={p.progress} />
            </div>
            <ul className="mt-4 space-y-2">
              {p.tasks.map((t) => (
                <li key={t.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      t.done ? 'bg-rosewash text-powder' : 'border border-line text-transparent'
                    }`}
                  >
                    <IconEl name="Check" size={12} />
                  </span>
                  <span className={t.done ? 'text-mauve line-through' : 'text-prune'}>{t.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 text-lg">Offboarding en cours</h3>
        {offboarding.map((p) => (
          <div key={p.who} className="flex items-center justify-between rounded-xl bg-wash p-4">
            <div className="flex items-center gap-3">
              <Avatar name={p.who} size={36} />
              <div>
                <p className="font-heading text-sm text-prune">{p.who}</p>
                <p className="text-xs text-mauve">{p.role}</p>
              </div>
            </div>
            <div className="w-40"><Progress value={p.progress} /></div>
            <Badge tone="peach">Restitution matériel</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
