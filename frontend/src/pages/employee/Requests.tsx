import { useState } from 'react';
import { Card, PageIntro, StatusBadge, Button, Field, EmptyState, useAsync } from '../../components/ui';
import { useStore, store } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { hr, businessDays } from '../../lib/api';
import { dateShort } from '../../lib/format';

const KINDS = [
  { value: 'Congés payés', label: 'Congés payés' },
  { value: 'RTT', label: 'RTT' },
  { value: 'Maladie', label: 'Maladie' },
  { value: 'Sans solde', label: 'Congé sans solde' },
  { value: 'Attestation', label: 'Attestation de travail' },
  { value: 'Note de frais', label: 'Note de frais' },
];
const isAbsence = (k: string) => !['Attestation', 'Note de frais'].includes(k);

export default function EmpRequests() {
  const { user } = useAuth();
  const employees = useStore((d) => d.employees);
  const absences = useStore((d) => d.absences);
  const activity = useStore((d) => d.activity);
  const emp = employees.find((e) => e.id === user?.employeeId);

  const [kind, setKind] = useState('Congés payés');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [ok, setOk] = useState(false);
  const req = useAsync(async () => {
    if (isAbsence(kind)) {
      if (!emp) return;
      await hr.requestAbsence({ employeeId: emp.id, who: emp.name, type: kind, from, to, reason: note });
    } else {
      store.log(`Demande « ${kind} » de ${emp?.name ?? 'salarié'}${note ? ` — ${note}` : ''}.`);
    }
  });

  const mine = absences.filter((a) => a.employeeId === emp?.id);
  const myOther = activity.filter((a) => a.text.startsWith('Demande «') && a.text.includes(emp?.name ?? '###'));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await req.run();
    setOk(true);
    setFrom(''); setTo(''); setNote('');
    setTimeout(() => setOk(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageIntro title="Mes demandes" text="Une demande d'absence part immédiatement en validation auprès du service RH." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <h3 className="text-lg">Nouvelle demande</h3>
          <form className="mt-4 space-y-4" onSubmit={submit}>
            <Field label="Type" value={kind} onChange={setKind} options={KINDS} />
            {isAbsence(kind) && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Du" type="date" value={from} onChange={setFrom} required />
                <Field label="Au" type="date" value={to} onChange={setTo} required />
              </div>
            )}
            {isAbsence(kind) && from && to && (
              <p className="text-xs text-mauve">Durée : <span className="font-mono">{businessDays(from, to)} j ouvré(s)</span></p>
            )}
            <label className="block">
              <span className="v-label">Message (facultatif)</span>
              <textarea rows={3} className="v-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Précisez votre demande…" />
            </label>
            <Button type="submit" icon="ArrowRight" loading={req.loading}>Envoyer la demande</Button>
            {ok && <p className="text-sm text-prune">✓ Votre demande a bien été transmise au service RH.</p>}
          </form>
        </Card>

        <Card>
          <h3 className="text-lg">Historique</h3>
          {mine.length === 0 && myOther.length === 0 ? (
            <EmptyState icon="Clipboard" title="Aucune demande" />
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {mine.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-prune">{r.type} — {dateShort(r.from)} → {dateShort(r.to)}</p>
                    <p className="font-mono text-xs text-mauve">{r.days} j · déposée le {dateShort(r.createdAt)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
              {myOther.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <p className="text-sm text-prune">{a.text}</p>
                  <StatusBadge status="En cours" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
