import { Card, PageIntro, Badge, StatusBadge, EmptyState } from '../../components/ui';
import { useShifts, useAbsences } from '../../lib/api';
import { absenceStatusLabel, absenceTypeLabel } from '../../lib/labels';
import { dateShort } from '../../lib/format';

const dayName = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });

export default function EmpPlanning() {
  const { data: shifts = [], isLoading } = useShifts({ mine: true });
  const { data: absences = [] } = useAbsences({ mine: true });
  const upcoming = absences
    .filter((a) => a.status !== 'REFUSED')
    .sort((x, y) => x.startDate.localeCompare(y.startDate));

  return (
    <div className="space-y-6">
      <PageIntro title="Mon planning" text="Vos horaires, votre lieu de travail et vos absences." />

      <Card>
        <h3 className="mb-4 text-lg">Semaine planifiée</h3>
        {isLoading ? (
          <p className="py-6 text-center text-sm text-mauve">Chargement…</p>
        ) : shifts.length === 0 ? (
          <p className="py-6 text-center text-sm text-mauve">Aucun créneau planifié.</p>
        ) : (
          <div className="space-y-2">
            {shifts.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl bg-wash p-4"
              >
                <span className="font-heading text-sm capitalize text-prune">{dayName(s.date)}</span>
                <span className="text-sm text-mauve">
                  {s.location} · {s.startTime}–{s.endTime}
                </span>
                <Badge tone={s.location === 'Télétravail' ? 'neutral' : 'sage'}>
                  {s.location === 'Télétravail' ? 'Télétravail' : 'Sur site'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 text-lg">Mes absences</h3>
        {upcoming.length === 0 ? (
          <EmptyState
            icon="Calendar"
            title="Aucune absence"
            text="Déposez une demande depuis « Demandes »."
          />
        ) : (
          <ul className="space-y-2">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-xl bg-wash p-4"
              >
                <div>
                  <p className="font-heading text-sm text-prune">
                    {absenceTypeLabel[a.type] ?? a.type}
                  </p>
                  <p className="text-xs text-mauve">
                    Du {dateShort(a.startDate)} au {dateShort(a.endDate)} · {a.days} j
                  </p>
                </div>
                <StatusBadge status={absenceStatusLabel[a.status] ?? a.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
