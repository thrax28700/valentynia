import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Button, IconEl, cx } from './ui';

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/tarifs', label: 'Tarifs' },
];

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src="/valentynia.svg" alt="" className="h-9 w-9" />
      <span className="font-heading text-xl font-semibold tracking-tight text-prune">Valentynia</span>
    </Link>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/80 backdrop-blur">
      <nav className="v-container flex h-20 items-center justify-between py-4">
        <Wordmark />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cx('rounded-full px-4 py-2 font-heading text-sm text-mauve transition hover:bg-wash', isActive && 'bg-white text-prune shadow-soft')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" to="/connexion">Connexion</Button>
          <Button to="/app" icon="ArrowRight">Découvrir la démo</Button>
        </div>
        <button className="v-btn-ghost md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <IconEl name={open ? 'Close' : 'Menu'} />
        </button>
      </nav>
      {open && (
        <div className="v-container flex flex-col gap-2 pb-5 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className="v-nav-link">
              {l.label}
            </NavLink>
          ))}
          <div className="mt-2 flex gap-3">
            <Button variant="secondary" to="/connexion" className="flex-1">Connexion</Button>
            <Button to="/app" className="flex-1">Démo</Button>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const cols = [
    { title: 'Produit', items: ['Modules RH', 'Facturation 2026', 'Assistant IA RH', 'Conformité légale', 'Tarifs'] },
    { title: 'Ressources', items: ['Centre d’aide', 'Guide réforme 2026', 'Statut du service', 'Journal des versions'] },
    { title: 'Entreprise', items: ['À propos', 'Sécurité & RGPD', 'Nous contacter', 'Mentions légales'] },
  ];
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="v-container grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mauve">
            L’humain, simplement. Gestion RH, conformité légale et facturation conforme à
            la réforme 2026, réunies dans une expérience calme.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-heading text-sm font-semibold text-prune">{c.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-mauve">
              {c.items.map((i) => (
                <li key={i}><a href="#" className="transition hover:text-prune">{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="v-container flex flex-col items-center justify-between gap-3 border-t border-line py-6 text-xs text-mauve md:flex-row">
        <p>© {new Date().getFullYear()} Valentynia. Tous droits réservés.</p>
        <p className="font-serif italic">« Valentynia — L’humain, simplement. »</p>
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
