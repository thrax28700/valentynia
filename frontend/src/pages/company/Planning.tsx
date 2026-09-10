import { useMemo } from 'react';
import { Card, PageIntro, Badge, Stat } from '../../components/ui';
import { useShifts } from '../../lib/api';

const locationTone: Record<string, 'sage' | 'peach' | 'powder' | 'neutral'> = {
  Bureau: 'sage',
  Télétravail: 'peach',
  Atelier: 'powder',
  Repos: 'neutral',
};

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });

export default function Planning() {
  const { data: shifts = [], isLoading } = useShifts();

  const { days, rows } = useMemo(() => {
    const dayset = Array.from(new Set(shifts.map((s) => s.date.slice(0, 10)))).sort();
    const byEmp = new Map<string, { name: string; cells: Record<string, string> }>();
    for (const s of shifts) {
      const key = s.employeeId;
      if (!byEmp.has(key)) byEmp.set(key, { name: s.employeeName ?? '—', cells: {} });
      byEmp.get(key)!.cells[s.date.slice(0, 10)] = s.location;
    }
    return { days: dayset, rows: [...byEmp.values()] };
  }, [shifts]);

  const overtimeAlerts = [
    'Marc Bonnet — 48 h sur la semaine 36 : durée maximale hebdomadaire approchée.',
    'Équipe Atelier — 3 salariés sans pause déjeuner pointée mardi.',
    'Repos quotidien de 11 h non respecté pour 1 salarié (jeudi → vendredi).',
  ];

  return (
    <div className="space-y-6">
      <PageIntro
        title="Planning & temps de travail"
        text="Plannings par équipe, pointages et suivi des heures. Alertes automatiques en cas de dépassement."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Heures contractuelles / semaine" value="35 h" />
        <Stat label="Heures supp. ce mois" value="34 h" delta="Atelier : +21 h" tone="down" />
        <Stat label="Taux d’occupation" value="94 %" />
      </div>

      <Card className="overflow-x-auto">
        <h3 className="mb-4 text-lg">Semaine planifiée</h3>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-mauve">Aucun créneau planifié.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-mauve">
                <th className="px-3 py-3 text-left font-heading font-medium">Salarié</th>
                {days.map((d) => (
                  <th key={d} className="px-3 py-3 text-left font-heading font-medium capitalize">
                    {dayLabel(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="px-3 py-3 font-heading text-sm text-prune">{r.name}</td>
                  {days.map((d) => {
                    const loc = r.cells[d];
                    return (
                      <td key={d} className="px-3 py-3">
                        {loc ? (
                          <Badge tone={locationTone[loc] ?? 'neutral'}>{loc}</Badge>
                        ) : (
                          <span className="text-xs text-mauve">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h3 className="text-lg">Alertes temps de travail</h3>
        <ul className="mt-3 space-y-2 text-sm text-mauve">
          {overtimeAlerts.map((a) => (
            <li key={a}>• {a}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
