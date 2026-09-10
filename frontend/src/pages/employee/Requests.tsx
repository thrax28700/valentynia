import { useState } from 'react';
import { Card, PageIntro, StatusBadge, Button, Field, EmptyState } from '../../components/ui';
import { useAbsences, useRequests, useCreateAbsence, useCreateRequest } from '../../lib/api';
import { absenceStatusLabel, absenceTypeLabel, requestStatusLabel } from '../../lib/labels';
import { dateShort, businessDays } from '../../lib/format';
import type { AbsenceType } from '../../lib/api';

const ABSENCE_KINDS: { value: AbsenceType; label: string }[] = [
  { value: 'PAID_LEAVE', label: 'Congés payés' },
  { value: 'RTT', label: 'RTT' },
  { value: 'SICK', label: 'Maladie' },
  { value: 'UNPAID', label: 'Congé sans solde' },
  { value: 'FAMILY', label: 'Événement familial' },
];
const OTHER_KINDS = [
  { value: 'Attestation de travail', label: 'Attestation de travail' },
  { value: 'Note de frais', label: 'Note de frais' },
];
const ALL_KINDS = [...ABSENCE_KINDS, ...OTHER_KINDS];
const isAbsenceKind = (v: string): v is AbsenceType =>
  ABSENCE_KINDS.some((k) => k.value === v);

export default function EmpRequests() {
  const { data: absences = [] } = useAbsences({ mine: true });
  const { data: requests = [] } = useRequests({ mine: true });
  const createAbsence = useCreateAbsence();
  const createRequest = useCreateRequest();

  const [kind, setKind] = useState<string>('PAID_LEAVE');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [ok, setOk] = useState(false);

  const busy = createAbsence.isPending || createRequest.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAbsenceKind(kind)) {
      await createAbsence.mutateAsync({ type: kind, startDate: from, endDate: to, reason: note || undefined });
    } else {
      await createRequest.mutateAsync({ kind, message: note || undefined });
    }
    setOk(true);
    setFrom('');
    setTo('');
    setNote('');
    setTimeout(() => setOk(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Mes demandes"
        text="Une demande d'absence part immédiatement en validation auprès du service RH."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <h3 className="text-lg">Nouvelle demande</h3>
          <form className="mt-4 space-y-4" onSubmit={submit}>
            <Field label="Type" value={kind} onChange={setKind} options={ALL_KINDS} />
            {isAbsenceKind(kind) && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Du" type="date" value={from} onChange={setFrom} required />
                <Field label="Au" type="date" value={to} onChange={setTo} required />
              </div>
            )}
            {isAbsenceKind(kind) && from && to && (
              <p className="text-xs text-mauve">
                Durée : <span className="font-mono">{businessDays(from, to)} j ouvré(s)</span>
              </p>
            )}
            <label className="block">
              <span className="v-label">Message (facultatif)</span>
              <textarea
                rows={3}
                className="v-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Précisez votre demande…"
              />
            </label>
            <Button type="submit" icon="ArrowRight" loading={busy}>
              Envoyer la demande
            </Button>
            {ok && (
              <p className="text-sm text-prune">✓ Votre demande a bien été transmise au service RH.</p>
            )}
          </form>
        </Card>

        <Card>
          <h3 className="text-lg">Historique</h3>
          {absences.length === 0 && requests.length === 0 ? (
            <EmptyState icon="Clipboard" title="Aucune demande" />
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {absences.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-prune">
                      {absenceTypeLabel[r.type] ?? r.type} — {dateShort(r.startDate)} →{' '}
                      {dateShort(r.endDate)}
                    </p>
                    <p className="font-mono text-xs text-mauve">
                      {r.days} j · déposée le {dateShort(r.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={absenceStatusLabel[r.status] ?? r.status} />
                </li>
              ))}
              {requests.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm text-prune">{r.kind}</p>
                    <p className="font-mono text-xs text-mauve">
                      déposée le {dateShort(r.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={requestStatusLabel[r.status] ?? r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
