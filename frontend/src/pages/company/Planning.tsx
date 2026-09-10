import { useMemo, useState } from 'react';
import { Card, PageIntro, Badge, Stat, Button, Modal, Field } from '../../components/ui';
import { useShifts, useCreateShift, useEmployees } from '../../lib/api';

const locationTone: Record<string, 'sage' | 'peach' | 'powder' | 'neutral'> = {
  Bureau: 'sage',
  Télétravail: 'peach',
  Atelier: 'powder',
  Repos: 'neutral',
};
const LOCATIONS = ['Bureau', 'Télétravail', 'Atelier', 'Repos'].map((v) => ({ value: v, label: v }));

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });

export default function Planning() {
  const { data: shifts = [], isLoading } = useShifts();
  const { data: employees = [] } = useEmployees();
  const create = useCreateShift();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '17:30',
    location: 'Bureau',
  });

  const { days, rows } = useMemo(() => {
    const dayset = Array.from(new Set(shifts.map((s) => s.date.slice(0, 10)))).sort();
    const byEmp = new Map<string, { name: string; cells: Record<string, string> }>();
    for (const s of shifts) {
      const key = s.employeeId;
      if (!byEmp.has(key)) byEmp.set(key, { name: s.employeeName ?? '—', cells: {} });
      byEmp.get(key)!.cells[s.date.slice(0, 10)] = s.location;
    }
    return { days: dayset, rows: [...byEmp.values()] };
  }, [shifts]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setForm({ ...form, employeeId: '' });
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Planning & temps de travail"
        text="Plannings par équipe, pointages et suivi des heures. Alertes automatiques en cas de dépassement."
        action={
          <Button icon="Plus" onClick={() => setModal(true)}>
            Nouveau créneau
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Heures contractuelles / semaine" value="35 h" />
        <Stat label="Créneaux planifiés" value={String(shifts.length)} delta="Semaine en cours" />
        <Stat label="Salariés planifiés" value={String(rows.length)} />
      </div>

      <Card className="overflow-x-auto">
        <h3 className="mb-4 text-lg">Semaine planifiée</h3>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-mauve">Aucun créneau planifié.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-mauve">
                <th className="px-3 py-3 text-left font-heading font-medium">Salarié</th>
                {days.map((d) => (
                  <th key={d} className="px-3 py-3 text-left font-heading font-medium capitalize">
                    {dayLabel(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="px-3 py-3 font-heading text-sm text-prune">{r.name}</td>
                  {days.map((d) => {
                    const loc = r.cells[d];
                    return (
                      <td key={d} className="px-3 py-3">
                        {loc ? (
                          <Badge tone={locationTone[loc] ?? 'neutral'}>{loc}</Badge>
                        ) : (
                          <span className="text-xs text-mauve">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h3 className="text-lg">Contrôles de conformité (durée du travail)</h3>
        <ul className="mt-3 space-y-2 text-sm text-mauve">
          <li>• Durée maximale hebdomadaire : 48 h (44 h en moyenne sur 12 semaines).</li>
          <li>• Repos quotidien minimal : 11 h consécutives.</li>
          <li>• Repos hebdomadaire minimal : 35 h consécutives.</li>
          <li>• Pause obligatoire de 20 min au-delà de 6 h de travail.</li>
        </ul>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau créneau de planning">
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
            label="Date"
            type="date"
            value={form.date}
            onChange={(v) => setForm({ ...form, date: v })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Début"
              type="time"
              value={form.startTime}
              onChange={(v) => setForm({ ...form, startTime: v })}
              required
            />
            <Field
              label="Fin"
              type="time"
              value={form.endTime}
              onChange={(v) => setForm({ ...form, endTime: v })}
              required
            />
          </div>
          <Field
            label="Lieu"
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v })}
            options={LOCATIONS}
          />
          {create.isError && (
            <p className="text-xs text-powderdark">{(create.error as Error).message}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>
              Annuler
            </Button>
            <Button type="submit" icon="Check" loading={create.isPending} disabled={!form.employeeId}>
              Ajouter au planning
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
