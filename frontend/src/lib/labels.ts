/**
 * Traduction des valeurs d'énumération de l'API en libellés français.
 * L'API renvoie des énums stables ; l'affichage est localisé ici.
 */

export const employeeStatusLabel: Record<string, string> = {
  ACTIVE: 'Actif',
  ONBOARDING: 'Onboarding',
  PROBATION: 'Période d’essai',
  ON_LEAVE: 'Congé',
  OFFBOARDING: 'Offboarding',
  LEFT: 'Parti',
};

export const absenceTypeLabel: Record<string, string> = {
  PAID_LEAVE: 'Congés payés',
  RTT: 'RTT',
  SICK: 'Maladie',
  UNPAID: 'Sans solde',
  FAMILY: 'Événement familial',
  OTHER: 'Autre',
};

export const absenceTypeValue: Record<string, string> = Object.fromEntries(
  Object.entries(absenceTypeLabel).map(([k, v]) => [v, k]),
);

export const absenceStatusLabel: Record<string, string> = {
  PENDING: 'À valider',
  APPROVED: 'Validé',
  REFUSED: 'Refusé',
  RECORDED: 'Enregistré',
};

export const ppfStatusLabel: Record<string, string> = {
  DRAFT: 'Brouillon',
  DEPOSITED: 'Déposée',
  RECEIVED_BY_PPF: 'Reçue par le PPF',
  REJECTED: 'Rejetée',
  ACCEPTED: 'Acceptée',
  DISPUTED: 'Litige',
  PAID: 'Encaissée',
};

export const requestStatusLabel: Record<string, string> = {
  PENDING: 'À traiter',
  IN_PROGRESS: 'En cours',
  DONE: 'Traité',
  REFUSED: 'Refusé',
  REIMBURSED: 'Remboursé',
};

export const alertLevelLabel: Record<string, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
};

export const planLabel: Record<string, string> = {
  ESSENTIEL: 'Essentiel',
  BUSINESS: 'Business',
  PREMIUM: 'Premium',
};

export const roleLabel: Record<string, string> = {
  ADMIN: 'Administrateur',
  HR: 'Gestionnaire RH',
  MANAGER: 'Manager',
  EMPLOYEE: 'Salarié',
};

export const contractLabel: Record<string, string> = {
  CDI: 'CDI',
  CDD: 'CDD',
  ALTERNANCE: 'Alternance',
  STAGE: 'Stage',
  INTERIM: 'Intérim',
};
