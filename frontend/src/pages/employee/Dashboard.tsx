import { Card, PageIntro, StatusBadge, Button, IconEl, IconBubble } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { myWeek } from '../../data/mock';
import { eur2, dateShort } from '../../lib/format';

export default function EmpDashboard() {
  const { user } = useAuth();
  const employees = useStore((d) => d.employees);
  const absences = useStore((d) => d.absences);
  const payslips = useStore((d) => d.payslips);
  const emp = employees.find((e) => e.id === user?.employeeId);
  const mine = absences.filter((a) => a.employeeId === emp?.id);
  const lastPay = payslips.filter((p) => p.employeeId === emp?.id)[0];

  const balances = [
    { i: 'Calendar' as const, k: 'Congés payés', v: `${emp?.leave.cp ?? 0} j` },
    { i: 'Clock' as const, k: 'RTT', v: `${emp?.leave.rtt ?? 0} j` },
    { i: 'Bolt' as const, k: 'Récupération', v: `${emp?.leave.recup ?? 0} j` },
  ];

  return (
    <div className="space-y-6">
      <PageIntro title={`Bonjour, ${user?.name.split(' ')[0] ?? ''}`} text="Documents, bulletins, demandes et planning — votre espace personnel." />

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
            <Button variant="ghost" to="/espace/bulletins" icon="ArrowRight">Tous</Button>
          </div>
          {lastPay ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-wash p-4">
              <div>
                <p className="font-heading text-sm text-prune">{lastPay.period}</p>
                <p className="text-xs text-mauve">Disponible depuis le {dateShort(lastPay.date)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg text-prune">{eur2.format(lastPay.net)}</p>
                <p className="text-xs text-mauve">net à payer</p>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-mauve">Aucun bulletin disponible.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Mes demandes</h3>
            <Button variant="ghost" to="/espace/demandes" icon="Plus">Nouvelle</Button>
          </div>
          {mine.length === 0 ? (
            <p className="py-6 text-center text-sm text-mauve">Aucune demande en cours.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {mine.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <span className="text-sm text-prune">{r.type} — {dateShort(r.from)}</span>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Ma semaine</h3>
          <Button variant="ghost" to="/espace/planning" icon="ArrowRight">Planning complet</Button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {myWeek.map((d) => (
            <div key={d.day} className="rounded-xl bg-wash p-3">
              <p className="font-heading text-xs text-mauve">{d.day}</p>
              <p className="mt-1 text-sm text-prune">{d.slots}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-wash to-rosewash">
        <div className="flex flex-wrap items-center gap-3">
          <IconEl name="Sparkle" size={20} className="text-powder" />
          <div>
            <p className="font-heading text-sm font-medium text-prune">Assistant IA</p>
            <p className="text-sm text-mauve">Une question RH ? Réponse immédiate et confidentielle.</p>
          </div>
          <Button to="/espace/assistant" className="ml-auto" icon="ArrowRight">Ouvrir</Button>
        </div>
      </Card>
    </div>
  );
}
