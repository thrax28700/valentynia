import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getToken, setToken } from './http';
import { roleHome, canAccessCompany } from './roles';
import type { Session, SessionUser } from './api/types';

type AuthCtx = {
  session: Session | null;
  user: SessionUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const SESSION_KEY = ['auth', 'session'] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => getToken());

  // Synchronise si le jeton change dans un autre onglet ou est invalidé (401).
  useEffect(() => {
    const sync = () => setTokenState(getToken());
    window.addEventListener('storage', sync);
    window.addEventListener('valentynia:auth', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('valentynia:auth', sync as EventListener);
    };
  }, []);

  const { data: session, isLoading } = useQuery({
    queryKey: SESSION_KEY,
    queryFn: ({ signal }) => api<Session>('/auth/me', { signal }),
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<{ token: string; user: SessionUser }>('/auth/login', {
        body: { email, password },
      });
      setToken(res.token);
      setTokenState(res.token);
      await qc.invalidateQueries({ queryKey: SESSION_KEY });
      return res.user;
    },
    [qc],
  );

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    qc.clear();
  }, [qc]);

  const value = useMemo<AuthCtx>(
    () => ({
      session: session ?? null,
      user: session?.user ?? null,
      token,
      loading: Boolean(token) && isLoading,
      login,
      logout,
    }),
    [session, token, isLoading, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}

/** Garde de route : exige une session, et éventuellement un espace précis. */
export function RequireAuth({
  children,
  space,
}: {
  children: ReactNode;
  space: 'entreprise' | 'salarié';
}) {
  const { user, token, loading } = useAuth();
  const loc = useLocation();

  if (token && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-mauve">
        Chargement…
      </div>
    );
  }
  if (!user) return <Navigate to="/connexion" state={{ from: loc.pathname }} replace />;

  const allowed = space === 'salarié' ? true : canAccessCompany(user.role);
  if (!allowed) return <Navigate to={roleHome(user.role)} replace />;

  return <>{children}</>;
}

export { roleHome };
