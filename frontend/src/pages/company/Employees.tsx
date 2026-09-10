import { useMemo, useState } from 'react';
import {
  Card,
  PageIntro,
  Table,
  Badge,
  StatusBadge,
  Avatar,
  Button,
  IconEl,
  Modal,
  Field,
  EmptyState,
} from '../../components/ui';
import { useEmployees, useCreateEmployee } from '../../lib/api';
import { employeeStatusLabel } from '../../lib/labels';
import { dateShort } from '../../lib/format';

const CONTRACTS = ['CDI', 'CDD', 'ALTERNANCE', 'STAGE', 'INTERIM'].map((v) => ({ value: v, label: v }));
const empty = {
  firstName: '',
  lastName: '',
  jobTitle: '',
  department: 'Tech',
  email: '',
  contractType: 'CDI',
  startDate: new Date().toISOString().slice(0, 10),
};

export default function Employees() {
  const { data: employees = [], isLoading, isError } = useEmployees();
  const create = useCreateEmployee();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('Tous');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);

  const depts = useMemo(
    () => ['Tous', ...Array.from(new Set(employees.map((e) => e.department)))],
    [employees],
  );
  const rows = employees.filter(
    (e) =>
      (dept === 'Tous' || e.department === dept) &&
      (e.fullName.toLowerCase().includes(q.toLowerCase()) ||
        e.jobTitle.toLowerCase().includes(q.toLowerCase())),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setForm(empty);
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Dossiers salariés"
        text="Contrats, coordonnées et carrière centralisés. Les données sensibles sont chiffrées (AES-256)."
        action={
          <Button icon="Plus" onClick={() => setModal(true)}>
            Nouveau salarié
          </Button>
        }
      />

      <Card>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <IconEl name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mauve" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un nom, un poste…"
              className="v-input pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1 rounded-full bg-wash p-1">
            {depts.map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`rounded-full px-3.5 py-1.5 font-heading text-xs transition ${
                  dept === d ? 'bg-white text-prune shadow-soft' : 'text-mauve'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-mauve">Chargement…</p>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-powderdark">Impossible de charger les salariés.</p>
        ) : rows.length === 0 ? (
          <EmptyState title="Aucun salarié" text="Ajustez la recherche ou ajoutez un nouveau dossier." />
        ) : (
          <Table head={['Salarié', 'Département', 'Contrat', 'Depuis', 'Statut', '']}>
            {rows.map((e) => (
              <tr key={e.id} className="text-prune transition hover:bg-wash">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={e.fullName} size={34} />
                    <div>
                      <p className="font-heading text-sm font-medium">{e.fullName}</p>
                      <p className="text-xs text-mauve">{e.jobTitle || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-mauve">{e.department}</td>
                <td className="px-3 py-3">
                  <Badge tone="neutral">{e.contractType}</Badge>
                </td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(e.startDate)}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={employeeStatusLabel[e.status] ?? e.status} />
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-mono text-xs text-mauve">CP {e.leave.paidLeave} j</span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau salarié">
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Prénom"
              value={form.firstName}
              onChange={(v) => setForm({ ...form, firstName: v })}
              required
            />
            <Field
              label="Nom"
              value={form.lastName}
              onChange={(v) => setForm({ ...form, lastName: v })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Poste"
              value={form.jobTitle}
              onChange={(v) => setForm({ ...form, jobTitle: v })}
              required
            />
            <Field
              label="Département"
              value={form.department}
              onChange={(v) => setForm({ ...form, department: v })}
              required
            />
          </div>
          <Field
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Contrat"
              value={form.contractType}
              onChange={(v) => setForm({ ...form, contractType: v })}
              options={CONTRACTS}
            />
            <Field
              label="Date d'entrée"
              type="date"
              value={form.startDate}
              onChange={(v) => setForm({ ...form, startDate: v })}
              required
            />
          </div>
          {create.isError && (
            <p className="text-xs text-powderdark">
              {(create.error as Error).message}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>
              Annuler
            </Button>
            <Button type="submit" icon="Check" loading={create.isPending}>
              Créer le dossier
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
