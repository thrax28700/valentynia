import { useMemo, useState } from 'react';
import { Card, PageIntro, Table, Badge, StatusBadge, Avatar, Button, IconEl, Modal, Field, EmptyState, useAsync } from '../../components/ui';
import { useStore } from '../../lib/store';
import { hr } from '../../lib/api';
import { dateShort } from '../../lib/format';

const CONTRACTS = ['CDI', 'CDD', 'ALTERNANCE', 'STAGE', 'INTERIM'].map((v) => ({ value: v, label: v }));
const empty = { name: '', role: '', dept: 'Tech', email: '', contract: 'CDI', since: new Date().toISOString().slice(0, 10) };

export default function Employees() {
  const employees = useStore((d) => d.employees);
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('Tous');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const add = useAsync(hr.addEmployee);

  const depts = useMemo(() => ['Tous', ...Array.from(new Set(employees.map((e) => e.dept)))], [employees]);
  const rows = employees.filter(
    (e) =>
      (dept === 'Tous' || e.dept === dept) &&
      (e.name.toLowerCase().includes(q.toLowerCase()) || e.role.toLowerCase().includes(q.toLowerCase())),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await add.run(form);
    setForm(empty);
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Dossiers salariés"
        text="Contrats, coordonnées et carrière centralisés. Les données sensibles sont chiffrées (AES-256)."
        action={<Button icon="Plus" onClick={() => setModal(true)}>Nouveau salarié</Button>}
      />

      <Card>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <IconEl name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mauve" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un nom, un poste…" className="v-input pl-9" />
          </div>
          <div className="flex flex-wrap gap-1 rounded-full bg-wash p-1">
            {depts.map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`rounded-full px-3.5 py-1.5 font-heading text-xs transition ${dept === d ? 'bg-white text-prune shadow-soft' : 'text-mauve'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="Aucun salarié" text="Ajustez la recherche ou ajoutez un nouveau dossier." />
        ) : (
          <Table head={['Salarié', 'Département', 'Contrat', 'Depuis', 'Statut', '']}>
            {rows.map((e) => (
              <tr key={e.id} className="text-prune transition hover:bg-wash">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={e.name} size={34} />
                    <div>
                      <p className="font-heading text-sm font-medium">{e.name}</p>
                      <p className="text-xs text-mauve">{e.role || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-mauve">{e.dept}</td>
                <td className="px-3 py-3"><Badge tone="neutral">{e.contract}</Badge></td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(e.since)}</td>
                <td className="px-3 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-3 py-3 text-right">
                  <span className="font-mono text-xs text-mauve">CP {e.leave.cp} j</span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau salarié">
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Nom complet" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required placeholder="Prénom Nom" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Poste" value={form.role} onChange={(v) => setForm({ ...form, role: v })} required />
            <Field label="Département" value={form.dept} onChange={(v) => setForm({ ...form, dept: v })} required />
          </div>
          <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contrat" value={form.contract} onChange={(v) => setForm({ ...form, contract: v })} options={CONTRACTS} />
            <Field label="Date d'entrée" type="date" value={form.since} onChange={(v) => setForm({ ...form, since: v })} required />
          </div>
          {add.error && <p className="text-xs text-powderdark">{add.error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button>
            <Button type="submit" icon="Check" loading={add.loading}>Créer le dossier</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
