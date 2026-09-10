import { Card, PageIntro, Button, Progress, Badge } from '../../components/ui';

const skills = ['Gestion de projet', 'Design produit', 'Développement', 'Relation client', 'Comptabilité', 'Management'];
const people = [
  { name: 'Camille Ferrand', levels: [4, 2, 1, 3, 2, 5] },
  { name: 'Yanis Moreau', levels: [3, 3, 5, 2, 1, 2] },
  { name: 'Sofia Renault', levels: [2, 1, 1, 5, 3, 1] },
  { name: 'Aïcha Diallo', levels: [2, 1, 1, 2, 5, 2] },
];

const dot = (n: number) =>
  ['bg-line', 'bg-powder/25', 'bg-powder/45', 'bg-powder/70', 'bg-powder'][n - 1] ?? 'bg-line';

export default function Skills() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Compétences"
        text="Référentiel métiers, matrice de compétences et plans de développement individuels."
        action={<Button icon="Plus">Ajouter une compétence</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-x-auto">
          <h3 className="mb-4 text-lg">Matrice de compétences</h3>
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-mauve">
                <th className="px-3 py-2 text-left font-heading font-medium">Salarié</th>
                {skills.map((s) => (
                  <th key={s} className="px-2 py-2 text-left font-heading font-medium">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {people.map((p) => (
                <tr key={p.name}>
                  <td className="px-3 py-3 font-heading text-sm text-prune">{p.name}</td>
                  {p.levels.map((l, i) => (
                    <td key={i} className="px-2 py-3">
                      <span className={`inline-block h-6 w-6 rounded-lg ${dot(l)}`} title={`Niveau ${l}/5`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-mauve">Échelle 1 (notions) → 5 (expert). Données déclaratives validées en entretien.</p>
        </Card>

        <Card>
          <h3 className="text-lg">Plans de développement</h3>
          <div className="mt-4 space-y-4">
            {[
              { who: 'Yanis Moreau', goal: 'Accessibilité web (RGAA)', p: 40 },
              { who: 'Sofia Renault', goal: 'Négociation commerciale', p: 70 },
              { who: 'Aïcha Diallo', goal: 'Facturation électronique 2026', p: 90 },
            ].map((d) => (
              <div key={d.who}>
                <div className="flex items-center justify-between">
                  <p className="font-heading text-sm text-prune">{d.who}</p>
                  <Badge tone="sage">Formation</Badge>
                </div>
                <p className="mb-1.5 text-xs text-mauve">{d.goal}</p>
                <Progress value={d.p} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
