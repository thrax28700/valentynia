import { Card, PageIntro, Badge, Progress, Avatar, IconEl } from '../../components/ui';
import { useOnboarding, useToggleOnboardingTask } from '../../lib/api';
import { dateLong } from '../../lib/format';

export default function Onboarding() {
  const { data: journeys = [], isLoading } = useOnboarding();
  const toggle = useToggleOnboardingTask();

  const onboarding = journeys.filter((j) => j.kind === 'ONBOARDING');
  const offboarding = journeys.filter((j) => j.kind === 'OFFBOARDING');

  return (
    <div className="space-y-6">
      <PageIntro
        title="Onboarding & offboarding"
        text="Parcours d’intégration et de départ guidés : checklists automatisées, matériel et signatures."
      />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-mauve">Chargement…</p>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {onboarding.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center gap-3">
                  <Avatar name={p.employeeName} />
                  <div>
                    <p className="font-heading text-sm font-medium text-prune">{p.employeeName}</p>
                    <p className="text-xs text-mauve">
                      {p.jobTitle} — arrivée le {dateLong(p.startDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress label="Progression" value={p.progress} />
                </div>
                <ul className="mt-4 space-y-2">
                  {p.tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-2.5 text-sm">
                      <button
                        onClick={() => toggle.mutate({ id: t.id, done: !t.done })}
                        className={`flex h-5 w-5 items-center justify-center rounded-full transition ${
                          t.done ? 'bg-rosewash text-powder' : 'border border-line text-transparent hover:border-powder'
                        }`}
                        aria-label={t.done ? 'Marquer à faire' : 'Marquer fait'}
                      >
                        <IconEl name="Check" size={12} />
                      </button>
                      <span className={t.done ? 'text-mauve line-through' : 'text-prune'}>
                        {t.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <Card>
            <h3 className="mb-4 text-lg">Offboarding en cours</h3>
            {offboarding.length === 0 ? (
              <p className="py-4 text-sm text-mauve">Aucun départ en cours.</p>
            ) : (
              offboarding.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-wash p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={p.employeeName} size={36} />
                    <div>
                      <p className="font-heading text-sm text-prune">{p.employeeName}</p>
                      <p className="text-xs text-mauve">
                        {p.jobTitle} — départ le {dateLong(p.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="w-40">
                    <Progress value={p.progress} />
                  </div>
                  <Badge tone="peach">
                    {p.tasks.find((t) => !t.done)?.label ?? 'Parcours terminé'}
                  </Badge>
                </div>
              ))
            )}
          </Card>
        </>
      )}
    </div>
  );
}
