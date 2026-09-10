import { useState } from 'react';
import { Card, PageIntro, Button, Field, Avatar, IconEl } from '../../components/ui';
import { useStore, store } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { dateLong } from '../../lib/format';

export default function EmpProfile() {
  const { user } = useAuth();
  const employees = useStore((d) => d.employees);
  const emp = employees.find((e) => e.id === user?.employeeId);

  const [phone, setPhone] = useState(emp?.phone ?? '06 12 34 56 78');
  const [address, setAddress] = useState(emp?.address ?? '14 rue des Tilleuls, 69003 Lyon');
  const [saved, setSaved] = useState(false);

  if (!emp) return null;
  const rows: [string, string][] = [
    ['Poste', emp.role],
    ['Département', emp.dept],
    ['Manager', emp.manager ?? '—'],
    ['Contrat', `${emp.contract} — depuis le ${dateLong(emp.since)}`],
    ['E-mail', emp.email],
  ];

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    store.set((d) => {
      const me = d.employees.find((x) => x.id === emp.id);
      if (me) { me.phone = phone; me.address = address; }
    });
    store.log('Coordonnées personnelles mises à jour.');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageIntro title="Mon profil" text="Vos informations. Les coordonnées personnelles sont modifiables et enregistrées." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex flex-col items-center text-center">
          <Avatar name={emp.name} size={88} />
          <p className="mt-4 font-heading text-lg font-medium text-prune">{emp.name}</p>
          <p className="text-sm text-mauve">{emp.role}</p>
        </Card>

        <Card>
          <h3 className="text-lg">Informations</h3>
          <dl className="mt-4 divide-y divide-line">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3 text-sm">
                <dt className="text-mauve">{k}</dt>
                <dd className="text-right font-heading text-prune">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg">Coordonnées personnelles</h3>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={save}>
          <Field label="Téléphone" value={phone} onChange={setPhone} />
          <Field label="Adresse" value={address} onChange={setAddress} />
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" icon="Check">Enregistrer</Button>
            {saved && <span className="text-sm text-prune">✓ Enregistré.</span>}
          </div>
        </form>
        <p className="mt-3 flex items-center gap-2 text-xs text-mauve">
          <IconEl name="Lock" size={13} /> Coordonnées bancaires chiffrées (AES-256), jamais affichées en clair — IBAN se terminant par
          <span className="font-mono"> {emp.iban?.slice(-4)}</span>.
        </p>
      </Card>
    </div>
  );
}
