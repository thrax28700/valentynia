import { useState } from 'react';
import { Card, PageIntro, Badge, Progress, Button, Avatar, Modal, Field } from '../../components/ui';
import { useReviewCampaigns, useUpcomingReviews, useCreateReviewCampaign } from '../../lib/api';
import { dateLong } from '../../lib/format';

export default function Reviews() {
  const { data: campaigns = [], isLoading } = useReviewCampaigns();
  const { data: upcoming = [] } = useUpcomingReviews();
  const create = useCreateReviewCampaign();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'annuel',
    deadline: '',
    total: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      name: form.name,
      type: form.type,
      deadline: form.deadline,
      total: form.total ? Number(form.total) : 0,
    });
    setForm({ name: '', type: 'annuel', deadline: '', total: '' });
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Entretiens annuels & professionnels"
        text="Campagnes, trames configurables et objectifs SMART, avec un historique pluriannuel consultable."
        action={
          <Button icon="Plus" onClick={() => setModal(true)}>
            Nouvelle campagne
          </Button>
        }
      />

      <div className="space-y-4">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-mauve">Aucune campagne. Créez-en une pour démarrer.</p>
        ) : (
          campaigns.map((c) => (
            <Card key={c.id} className="flex flex-wrap items-center gap-6">
              <div className="min-w-52 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-heading text-sm font-medium text-prune">{c.name}</p>
                  <Badge tone={c.status === 'Clôturée' ? 'sage' : 'peach'}>{c.status}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-mauve">Échéance : {dateLong(c.deadline)}</p>
              </div>
              <div className="w-full max-w-xs">
                <Progress
                  label={`${c.done} / ${c.total} réalisés`}
                  value={c.total ? Math.round((c.done / c.total) * 100) : 0}
                />
              </div>
            </Card>
          ))
        )}
      </div>

      <Card>
        <h3 className="mb-4 text-lg">Prochains entretiens</h3>
        {upcoming.length === 0 ? (
          <p className="py-4 text-sm text-mauve">Aucun entretien planifié.</p>
        ) : (
          <ul className="divide-y divide-line">
            {upcoming.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={u.employeeName} size={34} />
                  <div>
                    <p className="font-heading text-sm text-prune">{u.employeeName}</p>
                    <p className="text-xs text-mauve">{u.campaign}</p>
                  </div>
                </div>
                <span className="font-mono text-sm text-mauve">{dateLong(u.scheduledAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouvelle campagne d'entretiens">
        <form className="space-y-4" onSubmit={submit}>
          <Field
            label="Nom de la campagne"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
            placeholder="Entretiens annuels 2027"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Type"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={[
                { value: 'annuel', label: 'Entretien annuel' },
                { value: 'professionnel', label: 'Entretien professionnel' },
                { value: 'mi-année', label: 'Point mi-année' },
              ]}
            />
            <Field
              label="Salariés concernés"
              type="number"
              value={form.total}
              onChange={(v) => setForm({ ...form, total: v })}
              placeholder="142"
            />
          </div>
          <Field
            label="Échéance"
            type="date"
            value={form.deadline}
            onChange={(v) => setForm({ ...form, deadline: v })}
            required
          />
          {create.isError && (
            <p className="text-xs text-powderdark">{(create.error as Error).message}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>
              Annuler
            </Button>
            <Button type="submit" icon="Check" loading={create.isPending}>
              Créer la campagne
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
