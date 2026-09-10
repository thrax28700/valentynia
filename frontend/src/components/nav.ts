import type { IconName } from '../lib/icons';

export type NavItem = { to: string; label: string; icon: IconName; end?: boolean; group?: string };

export const companyNav: NavItem[] = [
  { to: '/app', label: 'Vue globale', icon: 'Home', end: true },
  { to: '/app/salaries', label: 'Salariés', icon: 'Users', group: 'Ressources humaines' },
  { to: '/app/absences', label: 'Absences / congés', icon: 'Calendar', group: 'Ressources humaines' },
  { to: '/app/planning', label: 'Planning / temps', icon: 'Clock', group: 'Ressources humaines' },
  { to: '/app/onboarding', label: 'On / Offboarding', icon: 'Clipboard', group: 'Ressources humaines' },
  { to: '/app/documents', label: 'Documents RH', icon: 'DocText', group: 'Ressources humaines' },
  { to: '/app/entretiens', label: 'Entretiens', icon: 'Chat', group: 'Ressources humaines' },
  { to: '/app/competences', label: 'Compétences', icon: 'Target', group: 'Ressources humaines' },
  { to: '/app/facturation', label: 'Facturation 2026', icon: 'Receipt', group: 'Finance & conformité' },
  { to: '/app/conformite', label: 'Conformité légale', icon: 'Shield', group: 'Finance & conformité' },
  { to: '/app/ia', label: 'Assistant IA RH', icon: 'Sparkle', group: 'Intelligence' },
  { to: '/app/parametres', label: 'Paramètres', icon: 'Settings', group: 'Entreprise' },
];

export const employeeNav: NavItem[] = [
  { to: '/espace', label: 'Accueil', icon: 'Home', end: true },
  { to: '/espace/documents', label: 'Documents', icon: 'DocText' },
  { to: '/espace/bulletins', label: 'Bulletins', icon: 'Receipt' },
  { to: '/espace/demandes', label: 'Demandes', icon: 'Clipboard' },
  { to: '/espace/planning', label: 'Planning', icon: 'Clock' },
  { to: '/espace/profil', label: 'Profil', icon: 'User' },
  { to: '/espace/assistant', label: 'Assistant IA', icon: 'Sparkle' },
];
