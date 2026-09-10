import { Card, PageIntro, Progress, Badge } from '../../components/ui';
import { useSkills, useDevelopmentPlans } from '../../lib/api';

const dot = (n: number) =>
  ['bg-line', 'bg-powder/25', 'bg-powder/45', 'bg-powder/70', 'bg-powder'][n - 1] ?? 'bg-line';

export default function Skills() {
  const { data, isLoading } = useSkills();
  const { data: plans = [] } = useDevelopmentPlans();
  const skills = data?.skills ?? [];
  const matrix = data?.matrix ?? [];

  return (
    <div className="space-y-6">
      <PageIntro
        title="Compétences"
        text="Référentiel métiers, matrice de compétences et plans de développement individuels."
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-x-auto">
          <h3 className="mb-4 text-lg">Matrice de compétences</h3>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-mauve">
                  <th className="px-3 py-2 text-left font-heading font-medium">Salarié</th>
                  {skills.map((s) => (
                    <th key={s.id} className="px-2 py-2 text-left font-heading font-medium">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {matrix.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-3 font-heading text-sm text-prune">{p.name}</td>
                    {skills.map((s) => {
                      const lvl = p.levels[s.id] ?? 0;
                      return (
                        <td key={s.id} className="px-2 py-3">
                          <span
                            className={`inline-block h-6 w-6 rounded-lg ${dot(lvl)}`}
                            title={lvl ? `Niveau ${lvl}/5` : 'Non évalué'}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-xs text-mauve">
            Échelle 1 (notions) → 5 (expert). Données déclaratives validées en entretien.
          </p>
        </Card>

        <Card>
          <h3 className="text-lg">Plans de développement</h3>
          <div className="mt-4 space-y-4">
            {plans.map((d) => (
              <div key={d.id}>
                <div className="flex items-center justify-between">
                  <p className="font-heading text-sm text-prune">{d.employeeName}</p>
                  <Badge tone="sage">{d.status}</Badge>
                </div>
                <p className="mb-1.5 text-xs text-mauve">{d.goal}</p>
                <Progress value={d.progress} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
