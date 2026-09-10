import { Card, PageIntro, Badge, StatusBadge, EmptyState } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { myWeek } from '../../data/mock';
import { dateShort } from '../../lib/format';

export default function EmpPlanning() {
  const { user } = useAuth();
  const employees = useStore((d) => d.employees);
  const absences = useStore((d) => d.absences);
  const emp = employees.find((e) => e.id === user?.employeeId);
  const upcoming = absences
    .filter((a) => a.employeeId === emp?.id && a.status !== 'Refusé')
    .sort((x, y) => x.from.localeCompare(y.from));

  return (
    <div className="space-y-6">
      <PageIntro title="Mon planning" text="Vos horaires, votre lieu de travail et vos absences." />

      <Card>
        <h3 className="mb-4 text-lg">Semaine en cours</h3>
        <div className="space-y-2">
          {myWeek.map((d) => (
            <div key={d.day} className="flex items-center justify-between rounded-xl bg-wash p-4">
              <span className="font-heading text-sm text-prune">{d.day}</span>
              <span className="text-sm text-mauve">{d.slots}</span>
              <Badge tone={d.slots.includes('Télétravail') ? 'neutral' : 'sage'}>
                {d.slots.includes('Télétravail') ? 'Télétravail' : 'Sur site'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg">Mes absences</h3>
        {upcoming.length === 0 ? (
          <EmptyState icon="Calendar" title="Aucune absence" text="Déposez une demande depuis « Demandes »." />
        ) : (
          <ul className="space-y-2">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-xl bg-wash p-4">
                <div>
                  <p className="font-heading text-sm text-prune">{a.type}</p>
                  <p className="text-xs text-mauve">Du {dateShort(a.from)} au {dateShort(a.to)} · {a.days} j</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
