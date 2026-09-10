import { Card, PageIntro, Badge, Button, Stat } from '../../components/ui';
import { useStore } from '../../lib/store';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const shifts = ['Bureau', 'Télétravail', 'Atelier', 'Repos', 'Bureau'];
const tone: Record<string, 'sage' | 'peach' | 'powder' | 'neutral'> = {
  Bureau: 'sage',
  'Télétravail': 'peach',
  Atelier: 'powder',
  Repos: 'neutral',
};

export default function Planning() {
  const employees = useStore((d) => d.employees);
  return (
    <div className="space-y-6">
      <PageIntro
        title="Planning & temps de travail"
        text="Plannings par équipe, pointages et suivi des heures. Alertes automatiques en cas de dépassement."
        action={<Button icon="Plus">Nouveau planning</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Heures contractuelles / semaine" value="35 h" />
        <Stat label="Heures supp. ce mois" value="34 h" delta="Atelier : +21 h" tone="down" />
        <Stat label="Taux d’occupation" value="94 %" />
      </div>

      <Card className="overflow-x-auto">
        <h3 className="mb-4 text-lg">Semaine du 8 au 12 septembre</h3>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-mauve">
              <th className="px-3 py-3 text-left font-heading font-medium">Salarié</th>
              {days.map((d) => (
                <th key={d} className="px-3 py-3 text-left font-heading font-medium">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {employees.slice(0, 5).map((e, ri) => (
              <tr key={e.id}>
                <td className="px-3 py-3 font-heading text-sm text-prune">{e.name}</td>
                {days.map((_, ci) => {
                  const s = shifts[(ri + ci) % shifts.length];
                  return (
                    <td key={ci} className="px-3 py-3">
                      <Badge tone={tone[s]}>{s}</Badge>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="text-lg">Alertes temps de travail</h3>
        <ul className="mt-3 space-y-2 text-sm text-mauve">
          <li>• Marc Bonnet — 48 h sur la semaine 36 : durée maximale hebdomadaire approchée.</li>
          <li>• Équipe Atelier — 3 salariés sans pause déjeuner pointée mardi.</li>
          <li>• Repos quotidien de 11 h non respecté pour 1 salarié (jeudi → vendredi).</li>
        </ul>
      </Card>
    </div>
  );
}
