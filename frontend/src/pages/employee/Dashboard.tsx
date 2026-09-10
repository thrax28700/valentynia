import { Card, PageIntro, StatusBadge, Button, IconEl, IconBubble } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { useEmployee, useAbsences, usePayslips, useShifts } from '../../lib/api';
import { absenceStatusLabel, absenceTypeLabel } from '../../lib/labels';
import { eur2, dateShort } from '../../lib/format';

export default function EmpDashboard() {
  const { user } = useAuth();
  const { data: emp } = useEmployee(user?.employeeId ?? undefined);
  const { data: absences = [] } = useAbsences({ mine: true });
  const { data: payslips = [] } = usePayslips({ mine: true });
  const { data: shifts = [] } = useShifts({ mine: true });
  const lastPay = payslips[0];

  const balances = [
    { i: 'Calendar' as const, k: 'Congés payés', v: `${emp?.leave.paidLeave ?? 0} j` },
    { i: 'Clock' as const, k: 'RTT', v: `${emp?.leave.rtt ?? 0} j` },
    { i: 'Bolt' as const, k: 'Récupération', v: `${emp?.leave.recovery ?? 0} j` },
  ];

  const week = shifts.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageIntro
        title={`Bonjour, ${user?.name.split(' ')[0] ?? ''}`}
        text="Documents, bulletins, demandes et planning — votre espace personnel."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {balances.map((s) => (
          <Card key={s.k} className="flex items-center gap-4">
            <IconBubble name={s.i} tone="peach" />
            <div>
              <p className="font-heading text-xs uppercase tracking-wide text-mauve">{s.k}</p>
              <p className="v-stat">{s.v}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Dernier bulletin</h3>
            <Button variant="ghost" to="/espace/bulletins" icon="ArrowRight">
              Tous
            </Button>
          </div>
          {lastPay ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-wash p-4">
              <div>
                <p className="font-heading text-sm text-prune">{lastPay.period}</p>
                <p className="text-xs text-mauve">
                  Disponible depuis le {dateShort(lastPay.releasedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg text-prune">{eur2.format(lastPay.netAmount)}</p>
                <p className="text-xs text-mauve">net à payer</p>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-mauve">Aucun bulletin disponible.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Mes demandes d'absence</h3>
            <Button variant="ghost" to="/espace/demandes" icon="Plus">
              Nouvelle
            </Button>
          </div>
          {absences.length === 0 ? (
            <p className="py-6 text-center text-sm text-mauve">Aucune demande en cours.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {absences.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <span className="text-sm text-prune">
                    {absenceTypeLabel[r.type] ?? r.type} — {dateShort(r.startDate)}
                  </span>
                  <StatusBadge status={absenceStatusLabel[r.status] ?? r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Ma semaine</h3>
          <Button variant="ghost" to="/espace/planning" icon="ArrowRight">
            Planning complet
          </Button>
        </div>
        {week.length === 0 ? (
          <p className="py-6 text-center text-sm text-mauve">Aucun créneau planifié.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {week.map((s) => (
              <div key={s.id} className="rounded-xl bg-wash p-3">
                <p className="font-heading text-xs capitalize text-mauve">
                  {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                </p>
                <p className="mt-1 text-sm text-prune">
                  {s.location} · {s.startTime}–{s.endTime}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="bg-gradient-to-r from-wash to-rosewash">
        <div className="flex flex-wrap items-center gap-3">
          <IconEl name="Sparkle" size={20} className="text-powder" />
          <div>
            <p className="font-heading text-sm font-medium text-prune">Assistant IA</p>
            <p className="text-sm text-mauve">Une question RH ? Réponse immédiate et confidentielle.</p>
          </div>
          <Button to="/espace/assistant" className="ml-auto" icon="ArrowRight">
            Ouvrir
          </Button>
        </div>
      </Card>
    </div>
  );
}
