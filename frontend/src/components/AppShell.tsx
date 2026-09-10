import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { NavItem } from './nav';
import { Avatar, IconEl, cx } from './ui';
import { useAuth } from '../lib/auth';
import { useCompany } from '../lib/api';
import { canAccessCompany } from '../lib/roles';
import { planLabel } from '../lib/labels';

function groupItems(nav: NavItem[]) {
  const out: { group: string | null; items: NavItem[] }[] = [];
  for (const item of nav) {
    const g = item.group ?? null;
    const last = out[out.length - 1];
    if (last && last.group === g) last.items.push(item);
    else out.push({ group: g, items: [item] });
  }
  return out;
}

export default function AppShell({ nav, space }: { nav: NavItem[]; space: 'entreprise' | 'salarié' }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: company } = useCompany();
  const companyName = company?.name ?? 'Mon entreprise';
  const current =
    nav.find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)) && n.to !== '/app' && n.to !== '/espace') ?? nav[0];
  const isCompany = space === 'entreprise';

  const doLogout = () => {
    logout();
    navigate('/connexion', { replace: true });
  };

  const Sidebar = (
    <aside className="flex h-full w-72 flex-col gap-6 bg-wash p-5">
      <Link to="/" className="flex items-center gap-2.5 px-2">
        <img src="/valentynia.svg" alt="" className="h-8 w-8" />
        <span className="font-heading text-lg font-semibold text-prune">Valentynia</span>
      </Link>

      <div className="v-card flex items-center gap-3 p-3">
        <Avatar name={isCompany ? companyName : user?.name ?? '—'} size={38} />
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-medium text-prune">
            {isCompany ? companyName : user?.name}
          </p>
          <p className="truncate text-xs text-mauve">
            {isCompany
              ? `Espace entreprise${company ? ` · ${planLabel[company.plan] ?? company.plan}` : ''}`
              : 'Espace salarié'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
        {groupItems(nav).map((section, i) => (
          <div key={i} className="space-y-1">
            {section.group && (
              <p className="px-3.5 pb-1 font-heading text-[11px] font-semibold uppercase tracking-wider text-mauve/70">
                {section.group}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cx('v-nav-link', isActive && 'v-nav-link-active')}
              >
                <IconEl name={item.icon} size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="space-y-1">
        {isCompany && user && canAccessCompany(user.role) && (
          <Link to="/espace" className="v-nav-link">
            <IconEl name="ArrowRight" size={18} />
            Voir l'espace salarié
          </Link>
        )}
        <button onClick={doLogout} className="v-nav-link w-full">
          <IconEl name="Logout" size={18} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-cream">
      <div className="hidden lg:block">{Sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-prune/20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full bg-cream shadow-soft-lg">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-cream/85 px-6 py-4 backdrop-blur lg:px-10">
          <div className="flex items-center gap-3">
            <button className="v-btn-ghost lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
              <IconEl name="Menu" />
            </button>
            <div>
              <p className="font-heading text-lg font-medium text-prune">{current.label}</p>
              <p className="text-xs text-mauve">Espace {space}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="v-btn-ghost" aria-label="Notifications">
              <IconEl name="Bell" />
            </button>
            <Avatar name={user?.name ?? '—'} size={36} />
          </div>
        </header>

        <main className="flex-1 px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
