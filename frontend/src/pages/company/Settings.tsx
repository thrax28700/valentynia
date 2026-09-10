import { useEffect, useState } from 'react';
import { Card, PageIntro, Button, Badge, IconEl } from '../../components/ui';
import { useCompany, useUpdateCompany } from '../../lib/api';
import { planLabel } from '../../lib/labels';

const modules = [
  { name: 'Modules RH', on: true },
  { name: 'Facturation 2026 (Factur-X + PPF)', on: true },
  { name: 'Conformité légale', on: true },
  { name: 'Assistant IA RH', on: true },
  { name: 'Analyse du moral (anonyme)', on: true },
  { name: 'Multi-sociétés', on: false },
];

export default function Settings() {
  const { data: company } = useCompany();
  const update = useUpdateCompany();

  const [form, setForm] = useState({ name: '', siren: '', collectiveAgreement: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        siren: company.siren,
        collectiveAgreement: company.collectiveAgreement ?? '',
      });
    }
  }, [company]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({
      name: form.name,
      siren: form.siren,
      collectiveAgreement: form.collectiveAgreement || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Paramètres entreprise"
        text="Identité, offre, modules activés et sécurité de l’espace."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg">Identité</h3>
          <form className="mt-4 space-y-4" onSubmit={save}>
            <div>
              <label className="v-label">Raison sociale</label>
              <input
                className="v-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="v-label">SIREN</label>
                <input
                  className="v-input font-mono"
                  value={form.siren}
                  onChange={(e) => setForm({ ...form, siren: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="v-label">Effectif</label>
                <input className="v-input font-mono" value={company?.headcount ?? '—'} readOnly />
              </div>
            </div>
            <div>
              <label className="v-label">Convention collective</label>
              <input
                className="v-input"
                value={form.collectiveAgreement}
                onChange={(e) => setForm({ ...form, collectiveAgreement: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" icon="Check" loading={update.isPending}>
                Enregistrer
              </Button>
              {saved && <span className="text-sm text-prune">✓ Enregistré.</span>}
              {update.isError && (
                <span className="text-sm text-powderdark">{(update.error as Error).message}</span>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <h3 className="text-lg">Offre & facturation</h3>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-wash p-4">
            <div>
              <p className="font-heading text-sm text-prune">
                Offre {company ? (planLabel[company.plan] ?? company.plan) : '…'}
              </p>
              <p className="text-xs text-mauve">
                11 € / salarié / mois · renouvellement le 1er janvier
              </p>
            </div>
            <Badge tone="powder">Active</Badge>
          </div>
          <Button variant="secondary" className="mt-4" to="/tarifs">
            Changer d’offre
          </Button>

          <h3 className="mt-8 text-lg">Sécurité</h3>
          <ul className="mt-3 space-y-2 text-sm text-mauve">
            {[
              'Authentification JWT + hachage bcrypt',
              'Chiffrement AES-256-GCM des données sensibles',
              'En-têtes de sécurité (Helmet) & limitation de débit',
              'Journal d’activité et piste d’audit',
            ].map((s) => (
              <li key={s} className="flex items-center gap-2">
                <IconEl name="Check" size={15} className="text-powder" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-lg">Modules accessibles</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between rounded-xl bg-wash p-4"
            >
              <span className="font-heading text-sm text-prune">{m.name}</span>
              <span
                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${
                  m.on ? 'justify-end bg-powder' : 'justify-start bg-line'
                }`}
              >
                <span className="h-5 w-5 rounded-full bg-white shadow-soft" />
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
