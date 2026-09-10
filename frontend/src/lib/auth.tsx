import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth as authApi, roleHome } from './api';
import { useStore, type User } from './store';

const TOKEN_KEY = 'valentynia:token';

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  // Recalcule l'utilisateur à partir du store (réactif) + du token.
  const users = useStore((d) => d.users);
  const user = useMemo(
    () => (token ? users.find((u) => `demo.${u.id}` === token) ?? null : null),
    [token, users],
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
    } catch {
      /* mode privé */
    }
    setToken(res.token);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* noop */
    }
    setToken(null);
  }, []);

  const value = useMemo(() => ({ user, token, login, logout }), [user, token, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}

/** Garde de route : exige une session, et éventuellement un espace précis. */
export function RequireAuth({ children, space }: { children: ReactNode; space: 'entreprise' | 'salarié' }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) return <Navigate to="/connexion" state={{ from: loc.pathname }} replace />;

  const allowed = space === 'salarié' ? true : user.role !== 'EMPLOYEE';
  if (!allowed) return <Navigate to={roleHome(user.role)} replace />;

  return <>{children}</>;
}
