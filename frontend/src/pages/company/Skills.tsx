import { useState } from 'react';
import { Card, PageIntro, Progress, Badge, Button, Modal, Field } from '../../components/ui';
import {
  useSkills,
  useDevelopmentPlans,
  useCreateSkill,
  useSetEmployeeSkill,
  useEmployees,
} from '../../lib/api';

const dot = (n: number) =>
  ['bg-line', 'bg-powder/25', 'bg-powder/45', 'bg-powder/70', 'bg-powder'][n - 1] ?? 'bg-line';

export default function Skills() {
  const { data, isLoading } = useSkills();
  const { data: plans = [] } = useDevelopmentPlans();
  const { data: employees = [] } = useEmployees();
  const addSkill = useCreateSkill();
  const setLevel = useSetEmployeeSkill();

  const skills = data?.skills ?? [];
  const matrix = data?.matrix ?? [];

  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');

  // Salariés à afficher dans la matrice : ceux déjà évalués, sinon tout l'effectif.
  const rows =
    matrix.length > 0
      ? matrix
      : employees.map((e) => ({ id: e.id, name: e.fullName, levels: {} as Record<string, number> }));

  const cycle = (employeeId: string, skillId: string, current: number) => {
    const next = current >= 5 ? 1 : current + 1;
    setLevel.mutate({ employeeId, skillId, level: next });
  };

  const submitSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSkill.mutateAsync(name.trim());
    setName('');
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Compétences"
        text="Référentiel métiers, matrice de compétences et plans de développement individuels."
        action={
          <Button icon="Plus" onClick={() => setModal(true)}>
            Ajouter une compétence
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-x-auto">
          <h3 className="mb-4 text-lg">Matrice de compétences</h3>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
          ) : skills.length === 0 ? (
            <p className="py-8 text-center text-sm text-mauve">
              Aucune compétence dans le référentiel.
            </p>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-mauve">
                  <th className="px-3 py-2 text-left font-heading font-medium">Salarié</th>
                  {skills.map((s) => (
                    <th key={s.id} className="px-2 py-2 text-left font-heading font-medium">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-3 font-heading text-sm text-prune">{p.name}</td>
                    {skills.map((s) => {
                      const lvl = p.levels[s.id] ?? 0;
                      return (
                        <td key={s.id} className="px-2 py-3">
                          <button
                            onClick={() => cycle(p.id, s.id, lvl)}
                            disabled={setLevel.isPending}
                            className={`inline-block h-6 w-6 rounded-lg transition hover:ring-2 hover:ring-powder/40 ${dot(lvl)}`}
                            title={
                              lvl ? `Niveau ${lvl}/5 — cliquer pour ajuster` : 'Non évalué — cliquer pour noter'
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-xs text-mauve">
            Échelle 1 (notions) → 5 (expert). Cliquez sur une case pour ajuster le niveau
            (validé en entretien).
          </p>
        </Card>

        <Card>
          <h3 className="text-lg">Plans de développement</h3>
          {plans.length === 0 ? (
            <p className="mt-4 text-sm text-mauve">Aucun plan en cours.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {plans.map((d) => (
                <div key={d.id}>
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-sm text-prune">{d.employeeName}</p>
                    <Badge tone="sage">{d.status}</Badge>
                  </div>
                  <p className="mb-1.5 text-xs text-mauve">{d.goal}</p>
                  <Progress value={d.progress} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter une compétence">
        <form className="space-y-4" onSubmit={submitSkill}>
          <Field
            label="Intitulé de la compétence"
            value={name}
            onChange={setName}
            required
            placeholder="Accessibilité web (RGAA)"
          />
          {addSkill.isError && (
            <p className="text-xs text-powderdark">{(addSkill.error as Error).message}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>
              Annuler
            </Button>
            <Button type="submit" icon="Check" loading={addSkill.isPending} disabled={!name.trim()}>
              Ajouter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
