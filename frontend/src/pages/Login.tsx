import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Field, IconEl, cx } from '../components/ui';
import { useAuth } from '../lib/auth';
import { roleHome } from '../lib/api';

const DEMO = {
  entreprise: { email: 'camille.ferrand@atelier-lumen.fr', label: 'Camille Ferrand · Directrice RH' },
  'salarié': { email: 'yanis.moreau@atelier-lumen.fr', label: 'Yanis Moreau · Développeur' },
};

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();
  const [mode, setMode] = useState<'entreprise' | 'salarié'>('entreprise');
  const [email, setEmail] = useState(DEMO.entreprise.email);
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pickMode = (m: 'entreprise' | 'salarié') => {
    setMode(m);
    setEmail(DEMO[m].email);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      const from = (loc.state as { from?: string } | null)?.from;
      nav(from && from.startsWith(roleHome(user.role)) ? from : roleHome(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-wash via-wash to-rosewash p-14 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/valentynia.svg" alt="" className="h-9 w-9" />
          <span className="font-heading text-xl font-semibold text-prune">Valentynia</span>
        </Link>
        <div>
          <p className="font-serif text-3xl leading-snug text-prune">« L'humain, simplement. »</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mauve">
            Démo interactive : vos actions (validations, factures, demandes…) sont réellement
            enregistrées dans votre navigateur.
          </p>
        </div>
        <p className="text-xs text-mauve">RGPD · Hébergement France · Chiffrement AES-256</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src="/valentynia.svg" alt="" className="h-9 w-9" />
            <span className="font-heading text-xl font-semibold text-prune">Valentynia</span>
          </Link>

          <h1 className="text-2xl">Bienvenue</h1>
          <p className="mt-1 text-sm text-mauve">Connectez-vous à votre espace.</p>

          <div className="mt-6 flex rounded-full bg-wash p-1">
            {(['entreprise', 'salarié'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => pickMode(m)}
                className={cx(
                  'flex-1 rounded-full py-2 font-heading text-sm capitalize transition',
                  mode === m ? 'bg-white text-prune shadow-soft' : 'text-mauve',
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <Field label="E-mail professionnel" type="email" value={email} onChange={setEmail} required />
            <Field label="Mot de passe" type="password" value={password} onChange={setPassword} required />
            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-rosewash px-3 py-2 text-xs text-powderdark">
                <IconEl name="Warning" size={14} /> {error}
              </p>
            )}
            <Button type="submit" className="w-full" icon="ArrowRight" loading={busy}>
              Se connecter à l'espace {mode}
            </Button>
          </form>

          <div className="mt-5 rounded-xl border border-line bg-wash p-3 text-xs text-mauve">
            <p className="font-heading font-semibold text-prune">Comptes de démonstration</p>
            <p className="mt-1">{DEMO[mode].label}</p>
            <p>Mot de passe : <span className="font-mono">demo1234</span></p>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-mauve">
            <IconEl name="Lock" size={14} /> Connexion chiffrée · session JWT locale
          </p>
        </div>
      </div>
    </div>
  );
}
