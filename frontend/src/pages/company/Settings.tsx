import { useNavigate } from 'react-router-dom';
import { Card, PageIntro, Button, Badge, IconEl } from '../../components/ui';
import { company } from '../../data/mock';
import { store, useStore } from '../../lib/store';

const modules = [
  { name: 'Modules RH', on: true },
  { name: 'Facturation 2026 (Factur-X + PPF)', on: true },
  { name: 'Conformité légale', on: true },
  { name: 'Assistant IA RH', on: true },
  { name: 'Analyse du moral (anonyme)', on: true },
  { name: 'Multi-sociétés', on: false },
];

export default function Settings() {
  const navigate = useNavigate();
  const employees = useStore((d) => d.employees);
  const invoices = useStore((d) => d.invoices);

  const resetDemo = () => {
    store.reset();
    navigate('/app');
  };

  return (
    <div className="space-y-6">
      <PageIntro title="Paramètres entreprise" text="Identité, offre, modules activés et sécurité de l’espace." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg">Identité</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="v-label">Raison sociale</label>
              <input className="v-input" defaultValue={company.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="v-label">SIREN</label>
                <input className="v-input font-mono" defaultValue={company.siren} />
              </div>
              <div>
                <label className="v-label">Effectif</label>
                <input className="v-input font-mono" defaultValue={employees.length} readOnly />
              </div>
            </div>
            <div>
              <label className="v-label">Convention collective</label>
              <input className="v-input" defaultValue="Bureaux d’études techniques (Syntec)" />
            </div>
            <Button icon="Check">Enregistrer</Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg">Offre & facturation</h3>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-wash p-4">
            <div>
              <p className="font-heading text-sm text-prune">Offre {company.plan}</p>
              <p className="text-xs text-mauve">11 € / salarié / mois · renouvellement le 1er janvier</p>
            </div>
            <Badge tone="powder">Active</Badge>
          </div>
          <Button variant="secondary" className="mt-4" to="/tarifs">Changer d’offre</Button>

          <h3 className="mt-8 text-lg">Sécurité</h3>
          <ul className="mt-3 space-y-2 text-sm text-mauve">
            <li className="flex items-center gap-2"><IconEl name="Check" size={15} className="text-powder" /> Authentification JWT + double facteur</li>
            <li className="flex items-center gap-2"><IconEl name="Check" size={15} className="text-powder" /> Chiffrement AES-256 des données sensibles</li>
            <li className="flex items-center gap-2"><IconEl name="Check" size={15} className="text-powder" /> Hébergement France · sauvegardes quotidiennes</li>
            <li className="flex items-center gap-2"><IconEl name="Check" size={15} className="text-powder" /> Journal d’accès et piste d’audit</li>
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-lg">Modules accessibles</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map((m) => (
            <div key={m.name} className="flex items-center justify-between rounded-xl bg-wash p-4">
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

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg">Données de démonstration</h3>
          <p className="mt-1 text-sm text-mauve">
            {employees.length} salariés · {invoices.length} factures. Vos actions sont enregistrées
            dans ce navigateur. Réinitialiser rétablit le jeu de données d'origine.
          </p>
        </div>
        <Button variant="secondary" icon="Bolt" onClick={resetDemo}>Réinitialiser la démo</Button>
      </Card>
    </div>
  );
}
