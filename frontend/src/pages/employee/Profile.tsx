import { useEffect, useState } from 'react';
import { Card, PageIntro, Button, Field, Avatar, IconEl } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { useEmployee, useUpdateEmployeeContact } from '../../lib/api';
import { contractLabel } from '../../lib/labels';
import { dateLong } from '../../lib/format';

export default function EmpProfile() {
  const { user } = useAuth();
  const { data: emp, isLoading } = useEmployee(user?.employeeId ?? undefined);
  const update = useUpdateEmployeeContact();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (emp) {
      setPhone(emp.phone ?? '');
      setAddress(emp.address ?? '');
    }
  }, [emp]);

  if (isLoading) return <p className="py-16 text-center text-sm text-mauve">Chargement…</p>;
  if (!emp) return <p className="py-16 text-center text-sm text-mauve">Profil indisponible.</p>;

  const rows: [string, string][] = [
    ['Poste', emp.jobTitle],
    ['Département', emp.department],
    ['Manager', emp.managerName ?? '—'],
    [
      'Contrat',
      `${contractLabel[emp.contractType] ?? emp.contractType} — depuis le ${dateLong(emp.startDate)}`,
    ],
    ['E-mail', emp.email],
  ];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({ id: emp.id, phone, address });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Mon profil"
        text="Vos informations. Les coordonnées personnelles sont modifiables et enregistrées."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex flex-col items-center text-center">
          <Avatar name={emp.fullName} size={88} />
          <p className="mt-4 font-heading text-lg font-medium text-prune">{emp.fullName}</p>
          <p className="text-sm text-mauve">{emp.jobTitle}</p>
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
            <Button type="submit" icon="Check" loading={update.isPending}>
              Enregistrer
            </Button>
            {saved && <span className="text-sm text-prune">✓ Enregistré.</span>}
          </div>
        </form>
        <p className="mt-3 flex items-center gap-2 text-xs text-mauve">
          <IconEl name="Lock" size={13} /> Coordonnées bancaires chiffrées (AES-256), jamais
          affichées en clair
          {emp.ibanLast4 && (
            <>
              {' '}
              — IBAN se terminant par <span className="font-mono">{emp.ibanLast4}</span>
            </>
          )}
          .
        </p>
      </Card>
    </div>
  );
}
