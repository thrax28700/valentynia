export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

/** Espace d'accueil selon le rôle. */
export const roleHome = (role: Role) => (role === 'EMPLOYEE' ? '/espace' : '/app');

/** Le rôle a-t-il accès à l'espace entreprise ? */
export const canAccessCompany = (role: Role) => role !== 'EMPLOYEE';
