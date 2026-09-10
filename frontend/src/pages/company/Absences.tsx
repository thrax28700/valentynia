import { useState } from 'react';
import { Card, PageIntro, Table, StatusBadge, Button, Stat, IconEl, Modal, Field, EmptyState, useAsync } from '../../components/ui';
import { useStore } from '../../lib/store';
import { hr, businessDays } from '../../lib/api';
import { dateShort } from '../../lib/format';

const TYPES = ['Congés payés', 'RTT', 'Maladie', 'Sans solde', 'Événement familial', 'Autre'].map((v) => ({ value: v, label: v }));

export default function Absences() {
  const absences = useStore((d) => d.absences);
  const employees = useStore((d) => d.employees);
  const decide = useAsync(hr.decideAbsence);
  const create = useAsync(hr.requestAbsence);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ employeeId: employees[0]?.id ?? '', type: 'Congés payés', from: '', to: '' });

  const pending = absences.filter((a) => a.status === 'À valider').length;
  const onLeave = absences.filter((a) => a.status === 'Validé').length;
  const avgCp = employees.length ? (employees.reduce((s, e) => s + e.leave.cp, 0) / employees.length).toFixed(1) : '0';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === form.employeeId);
    if (!emp) return;
    await create.run({ ...form, who: emp.name });
    setForm({ ...form, from: '', to: '' });
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Absences & congés"
        text="Demandes, validations et soldes en temps réel. Chaque décision met à jour les compteurs."
        action={<Button icon="Plus" onClick={() => setModal(true)}>Saisir une absence</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Demandes à valider" value={String(pending)} delta="Traitement immédiat" />
        <Stat label="Absences validées" value={String(onLeave)} delta="Sur la période" />
        <Stat label="Solde CP moyen" value={`${avgCp} j`} delta="Tous salariés" />
      </div>

      <Card>
        <h3 className="mb-4 text-lg">File de validation</h3>
        {absences.length === 0 ? (
          <EmptyState icon="Calendar" title="Aucune absence" />
        ) : (
          <Table head={['Salarié', 'Type', 'Période', 'Jours', 'Statut', 'Action']}>
            {absences.map((a) => (
              <tr key={a.id} className="text-prune">
                <td className="px-3 py-3 font-heading text-sm font-medium">{a.who}</td>
                <td className="px-3 py-3 text-mauve">{a.type}</td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(a.from)} → {dateShort(a.to)}</td>
                <td className="px-3 py-3 font-mono text-sm">{a.days}</td>
                <td className="px-3 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-3 py-3">
                  {a.status === 'À valider' ? (
                    <div className="flex gap-2">
                      <button className="v-btn-primary !px-3 !py-1.5 text-xs" disabled={decide.loading} onClick={() => decide.run(a.id, 'Validé')}>
                        <IconEl name="Check" size={14} />Valider
                      </button>
                      <button className="v-btn-secondary !px-3 !py-1.5 text-xs" disabled={decide.loading} onClick={() => decide.run(a.id, 'Refusé')}>
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
            options={employees.map((e) => ({ value: e.id, label: e.name }))}
          />
          <Field label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={TYPES} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Du" type="date" value={form.from} onChange={(v) => setForm({ ...form, from: v })} required />
            <Field label="Au" type="date" value={form.to} onChange={(v) => setForm({ ...form, to: v })} required />
          </div>
          {form.from && form.to && (
            <p className="text-xs text-mauve">Durée estimée : <span className="font-mono">{businessDays(form.from, form.to)} jour(s) ouvré(s)</span></p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button>
            <Button type="submit" icon="Check" loading={create.loading}>Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
