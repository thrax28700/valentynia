import { useState } from 'react';
import {
  Card,
  PageIntro,
  Table,
  StatusBadge,
  Button,
  Stat,
  IconEl,
  Modal,
  Field,
  EmptyState,
} from '../../components/ui';
import { useAbsences, useCreateAbsence, useDecideAbsence, useEmployees } from '../../lib/api';
import { absenceTypeLabel, absenceStatusLabel } from '../../lib/labels';
import { dateShort, businessDays } from '../../lib/format';
import type { AbsenceType } from '../../lib/api';

const TYPES = (Object.entries(absenceTypeLabel) as [AbsenceType, string][]).map(([value, label]) => ({
  value,
  label,
}));

export default function Absences() {
  const { data: absences = [], isLoading } = useAbsences();
  const { data: employees = [] } = useEmployees();
  const decide = useDecideAbsence();
  const create = useCreateAbsence();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    type: 'PAID_LEAVE' as AbsenceType,
    startDate: '',
    endDate: '',
  });

  const pending = absences.filter((a) => a.status === 'PENDING').length;
  const approved = absences.filter((a) => a.status === 'APPROVED').length;
  const avgCp = employees.length
    ? (employees.reduce((s, e) => s + e.leave.paidLeave, 0) / employees.length).toFixed(1)
    : '0';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      employeeId: form.employeeId || undefined,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    setForm({ ...form, startDate: '', endDate: '' });
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Absences & congés"
        text="Demandes, validations et soldes en temps réel. Chaque décision met à jour les compteurs."
        action={
          <Button icon="Plus" onClick={() => setModal(true)}>
            Saisir une absence
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Demandes à valider" value={String(pending)} delta="Traitement immédiat" />
        <Stat label="Absences validées" value={String(approved)} delta="Sur la période" />
        <Stat label="Solde CP moyen" value={`${avgCp} j`} delta="Tous salariés" />
      </div>

      <Card>
        <h3 className="mb-4 text-lg">File de validation</h3>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
        ) : absences.length === 0 ? (
          <EmptyState icon="Calendar" title="Aucune absence" />
        ) : (
          <Table head={['Salarié', 'Type', 'Période', 'Jours', 'Statut', 'Action']}>
            {absences.map((a) => (
              <tr key={a.id} className="text-prune">
                <td className="px-3 py-3 font-heading text-sm font-medium">{a.employeeName}</td>
                <td className="px-3 py-3 text-mauve">{absenceTypeLabel[a.type] ?? a.type}</td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">
                  {dateShort(a.startDate)} → {dateShort(a.endDate)}
                </td>
                <td className="px-3 py-3 font-mono text-sm">{a.days}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={absenceStatusLabel[a.status] ?? a.status} />
                </td>
                <td className="px-3 py-3">
                  {a.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <button
                        className="v-btn-primary !px-3 !py-1.5 text-xs"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ id: a.id, status: 'APPROVED' })}
                      >
                        <IconEl name="Check" size={14} />
                        Valider
                      </button>
                      <button
                        className="v-btn-secondary !px-3 !py-1.5 text-xs"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ id: a.id, status: 'REFUSED' })}
                      >
                        Refuser
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-mauve">—</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Saisir une absence">
        <form className="space-y-4" onSubmit={submit}>
          <Field
            label="Salarié"
            value={form.employeeId}
            onChange={(v) => setForm({ ...form, employeeId: v })}
            options={[
              { value: '', label: '— choisir —' },
              ...employees.map((e) => ({ value: e.id, label: e.fullName })),
            ]}
          />
          <Field
            label="Type"
            value={form.type}
            onChange={(v) => setForm({ ...form, type: v as AbsenceType })}
            options={TYPES}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Du"
              type="date"
              value={form.startDate}
              onChange={(v) => setForm({ ...form, startDate: v })}
              required
            />
            <Field
              label="Au"
              type="date"
              value={form.endDate}
              onChange={(v) => setForm({ ...form, endDate: v })}
              required
            />
          </div>
          {form.startDate && form.endDate && (
            <p className="text-xs text-mauve">
              Durée estimée :{' '}
              <span className="font-mono">
                {businessDays(form.startDate, form.endDate)} jour(s) ouvré(s)
              </span>
            </p>
          )}
          {create.isError && (
            <p className="text-xs text-powderdark">{(create.error as Error).message}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>
              Annuler
            </Button>
            <Button type="submit" icon="Check" loading={create.isPending} disabled={!form.employeeId}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
