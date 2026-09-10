import type { IconName } from '../lib/icons';

export type Module = {
  key: string;
  name: string;
  icon: IconName;
  desc: string;
  points: string[];
};

export const hrModules: Module[] = [
  { key: 'dossier', name: 'Dossier salarié', icon: 'User', desc: 'Toutes les informations RH centralisées et sécurisées.', points: ['Contrats & avenants', 'Coordonnées & RIB chiffrés', 'Historique de carrière'] },
  { key: 'absences', name: 'Absences / congés', icon: 'Calendar', desc: 'Demandes, validations et soldes en temps réel.', points: ['Workflow de validation', 'Soldes CP / RTT automatiques', 'Calendrier d’équipe'] },
  { key: 'planning', name: 'Planning / temps de travail', icon: 'Clock', desc: 'Plannings, pointages et suivi des heures.', points: ['Plannings par équipe', 'Badgeuse & annualisation', 'Alertes dépassement'] },
  { key: 'onboarding', name: 'Onboarding / offboarding', icon: 'Clipboard', desc: 'Parcours d’intégration et de départ guidés.', points: ['Checklists automatisées', 'Attribution de matériel', 'Signature électronique'] },
  { key: 'documents', name: 'Documents RH', icon: 'DocText', desc: 'Coffre-fort et diffusion des documents.', points: ['Coffre-fort salarié', 'Modèles personnalisables', 'Archivage à valeur probante'] },
  { key: 'entretiens', name: 'Entretiens annuels', icon: 'Chat', desc: 'Campagnes d’entretiens et suivi des objectifs.', points: ['Trames configurables', 'Objectifs SMART', 'Historique pluriannuel'] },
  { key: 'competences', name: 'Compétences', icon: 'Target', desc: 'Cartographie des compétences et plans de formation.', points: ['Référentiel métiers', 'Matrice de compétences', 'Plan de développement'] },
  { key: 'portail', name: 'Portail salarié', icon: 'Users', desc: 'Un espace autonome pour chaque collaborateur.', points: ['Bulletins & documents', 'Demandes en 1 clic', 'Assistant IA intégré'] },
];

export const billingModules: Module[] = [
  { key: 'facturx', name: 'Factur-X', icon: 'Receipt', desc: 'Factures hybrides PDF/A-3 + XML conformes 2026.', points: ['Profils EN 16931', 'Contrôles de cohérence', 'Aperçu lisible + données'] },
  { key: 'ppf', name: 'Envoi PPF', icon: 'Bolt', desc: 'Transmission au Portail Public de Facturation.', points: ['Cycle de vie normalisé', 'Statuts temps réel', 'Gestion des rejets'] },
  { key: 'archivage', name: 'Archivage légal', icon: 'Lock', desc: 'Conservation 10 ans à valeur probante.', points: ['Horodatage qualifié', 'Empreinte SHA-256', 'Piste d’audit fiable'] },
  { key: 'antifraude', name: 'Journal anti-fraude TVA', icon: 'Shield', desc: 'Inaltérabilité, sécurisation, conservation.', points: ['Chaînage des écritures', 'Clôtures périodiques', 'Export conforme'] },
  { key: 'relances', name: 'Relances automatiques', icon: 'Bell', desc: 'Scénarios de relance personnalisés.', points: ['Relances J+X paramétrables', 'E-mails doux et fermes', 'Suivi des promesses'] },
  { key: 'paiements', name: 'Suivi des paiements', icon: 'Chart', desc: 'Encaissements, rapprochement et DSO.', points: ['Rapprochement bancaire', 'Échéancier client', 'Prévision de trésorerie'] },
];

export const aiFeatures: { title: string; desc: string; icon: IconName }[] = [
  { title: 'Assistant RH intelligent', desc: 'Répond aux questions RH des managers et salariés, 24h/24, avec un ton calme et rassurant.', icon: 'Chat' },
  { title: 'Génération de documents RH', desc: 'Attestations, avenants, courriers : rédigés en quelques secondes, conformes à votre convention.', icon: 'DocText' },
  { title: 'Analyse des risques humains', desc: 'Identifie les tensions d’équipe et les risques de départ à partir de signaux agrégés.', icon: 'Warning' },
  { title: 'Prévision des absences', desc: 'Anticipe les pics d’absentéisme par période et par service pour mieux planifier.', icon: 'Calendar' },
  { title: 'Audit RH automatique', desc: 'Passe en revue vos pratiques et documents, et liste les points de mise en conformité.', icon: 'Shield' },
  { title: 'Recommandations personnalisées', desc: 'Des actions concrètes, priorisées selon l’impact et l’effort pour votre organisation.', icon: 'Sparkle' },
  { title: 'Analyse du moral (anonyme)', desc: 'Mesure le climat social sans jamais exposer les réponses individuelles.', icon: 'Heart' },
  { title: 'Détection des signaux faibles', desc: 'Repère tôt les évolutions discrètes : baisse d’engagement, surcharge, isolement.', icon: 'Target' },
  { title: 'Suggestions de prévention', desc: 'Propose des mesures de prévention adaptées avant que la situation ne se dégrade.', icon: 'Leaf' },
];

export const complianceItems: { title: string; desc: string; icon: IconName }[] = [
  { title: 'Vérification automatique des contrats', desc: 'Clauses obligatoires, mentions légales, cohérence avec la convention collective.', icon: 'DocText' },
  { title: 'Alertes légales', desc: 'Veille réglementaire : vous êtes prévenu·e avant chaque échéance qui vous concerne.', icon: 'Bell' },
  { title: 'Obligations RH', desc: 'Registre du personnel, affichages, DUERP, entretiens obligatoires : rien n’est oublié.', icon: 'Clipboard' },
  { title: 'RGPD', desc: 'Registre des traitements, durées de conservation, gestion des droits des personnes.', icon: 'Lock' },
];

export const testimonials = [
  { quote: 'Valentynia a rendu notre gestion RH sereine. Tout est clair, doux à l’œil, et pourtant très complet.', name: 'Camille Ferrand', role: 'DRH — Atelier Lumen (140 salariés)' },
  { quote: 'La bascule Factur-X + PPF s’est faite sans stress. Les statuts en temps réel nous ont fait gagner un temps fou.', name: 'Nadia Belkacem', role: 'Responsable ADV — Groupe Sévane' },
  { quote: 'L’assistant IA répond aux questions des managers à ma place. Je me concentre enfin sur l’humain.', name: 'Hélène Vasseur', role: 'RRH — Coopérative Sauge' },
];

export const pricingPlans = [
  {
    name: 'Essentiel',
    price: 6,
    unit: '/ salarié / mois',
    tagline: 'Pour structurer une PME qui grandit.',
    features: ['Dossier salarié & documents RH', 'Absences, congés & planning', 'Portail salarié', 'Facturation Factur-X (jusqu’à 200 factures/mois)', 'Support par e-mail'],
    cta: 'Commencer',
    highlight: false,
  },
  {
    name: 'Business',
    price: 11,
    unit: '/ salarié / mois',
    tagline: 'Le socle complet RH + facturation 2026.',
    features: ['Tout Essentiel, sans limite de factures', 'Envoi PPF & archivage légal 10 ans', 'Journal anti-fraude TVA', 'Onboarding / offboarding automatisés', 'Entretiens & compétences', 'Assistant IA RH', 'Support prioritaire'],
    cta: 'Essai 14 jours',
    highlight: true,
  },
  {
    name: 'Premium',
    price: null,
    unit: 'sur devis',
    tagline: 'Pour les groupes multi-entités.',
    features: ['Tout Business', 'Multi-sociétés & consolidation', 'Audit RH automatique & recommandations', 'Analyse du moral & signaux faibles', 'SSO / SCIM, SLA 99,9 %', 'Accompagnement dédié'],
    cta: 'Parler à un expert',
    highlight: false,
  },
];

export const premiumOptions = [
  'Module de paie connecté (partenaires agréés)',
  'Coffre-fort salarié à valeur probante étendu',
  'Connecteurs SIRH / comptabilité sur mesure',
  'Ateliers de déploiement sur site',
];

/* ---------- Données applicatives (démo) ---------- */
export const company = { name: 'Atelier Lumen', siren: '812 456 789', employees: 142, plan: 'Business' };

export const companyStats = [
  { label: 'Effectif', value: '142', delta: '+4 ce trimestre' },
  { label: 'Taux d’absentéisme', value: '3,1 %', delta: '− 0,4 pt vs. N-1', tone: 'up' as const },
  { label: 'Masse salariale / mois', value: '486 k€', delta: 'stable' },
  { label: 'Factures en attente PPF', value: '7', delta: '2 à corriger', tone: 'down' as const },
];

export const employees = [
  { id: 'e1', name: 'Camille Ferrand', role: 'Directrice RH', dept: 'Direction', contract: 'CDI', since: '2019-03-11', status: 'Actif' },
  { id: 'e2', name: 'Yanis Moreau', role: 'Développeur produit', dept: 'Tech', contract: 'CDI', since: '2022-09-05', status: 'Actif' },
  { id: 'e3', name: 'Sofia Renault', role: 'Chargée ADV', dept: 'Finance', contract: 'CDI', since: '2021-01-18', status: 'Actif' },
  { id: 'e4', name: 'Thomas Lefèvre', role: 'Designer', dept: 'Produit', contract: 'CDD', since: '2025-02-03', status: 'Période d’essai' },
  { id: 'e5', name: 'Aïcha Diallo', role: 'Comptable', dept: 'Finance', contract: 'CDI', since: '2020-06-22', status: 'Actif' },
  { id: 'e6', name: 'Marc Bonnet', role: 'Responsable atelier', dept: 'Production', contract: 'CDI', since: '2018-11-30', status: 'Congé' },
];

export const absenceRequests = [
  { id: 'a1', who: 'Yanis Moreau', type: 'Congés payés', from: '2026-09-22', to: '2026-09-26', days: 5, status: 'À valider' },
  { id: 'a2', who: 'Sofia Renault', type: 'RTT', from: '2026-09-12', to: '2026-09-12', days: 1, status: 'À valider' },
  { id: 'a3', who: 'Aïcha Diallo', type: 'Sans solde', from: '2026-10-01', to: '2026-10-03', days: 3, status: 'Validé' },
  { id: 'a4', who: 'Thomas Lefèvre', type: 'Maladie', from: '2026-09-04', to: '2026-09-05', days: 2, status: 'Enregistré' },
];

export const invoices = [
  { id: 'F-2026-0148', client: 'Groupe Sévane', amount: 12450, issued: '2026-09-01', due: '2026-10-01', ppf: 'Acceptée', paid: false },
  { id: 'F-2026-0147', client: 'Maison Aubertin', amount: 3820, issued: '2026-08-28', due: '2026-09-27', ppf: 'Encaissée', paid: true },
  { id: 'F-2026-0146', client: 'Coopérative Sauge', amount: 7600, issued: '2026-08-20', due: '2026-09-19', ppf: 'Rejetée', paid: false },
  { id: 'F-2026-0145', client: 'Studio Halcyon', amount: 2100, issued: '2026-08-14', due: '2026-09-13', ppf: 'Reçue par le PPF', paid: false },
  { id: 'F-2026-0144', client: 'Bureau Vell', amount: 5400, issued: '2026-08-02', due: '2026-09-01', ppf: 'Encaissée', paid: true },
];

export const legalAlerts = [
  { level: 'high', title: 'DUERP à mettre à jour', detail: 'Dernière mise à jour il y a 13 mois — obligation annuelle.', due: '2026-09-30' },
  { level: 'medium', title: 'Entretiens professionnels', detail: '6 salariés arrivent à l’échéance des 2 ans.', due: '2026-10-15' },
  { level: 'low', title: 'Affichage obligatoire', detail: 'Nouvelle mention égalité professionnelle à afficher.', due: '2026-11-01' },
  { level: 'medium', title: 'Registre RGPD', detail: '2 traitements sans durée de conservation renseignée.', due: '2026-09-20' },
];

export const aiInsights = [
  { tone: 'powder', title: 'Signal faible — équipe Production', text: 'Baisse de 12 % des validations de planning et hausse des heures supplémentaires sur 3 semaines. Un point d’équipe est suggéré.' },
  { tone: 'peach', title: 'Prévision d’absences — Octobre', text: 'Pic attendu semaine 42 (vacances scolaires). Anticipez 1 renfort sur l’atelier et le service ADV.' },
  { tone: 'sage', title: 'Climat social', text: 'Moral global stable (indice 7,4/10). L’item « reconnaissance » progresse de 0,3 pt ce trimestre.' },
];

/* ---------- Espace salarié (démo) ---------- */
export const me = {
  name: 'Yanis Moreau',
  role: 'Développeur produit',
  dept: 'Tech',
  manager: 'Camille Ferrand',
  email: 'yanis.moreau@atelier-lumen.fr',
  contract: 'CDI — depuis le 5 septembre 2022',
  leaveBalance: { cp: 14.5, rtt: 3, recup: 1 },
};

export const myPayslips = [
  { period: 'Août 2026', net: 2685.4, date: '2026-08-28' },
  { period: 'Juillet 2026', net: 2685.4, date: '2026-07-29' },
  { period: 'Juin 2026', net: 2712.9, date: '2026-06-27' },
  { period: 'Mai 2026', net: 2685.4, date: '2026-05-28' },
];

export const myDocuments = [
  { name: 'Contrat de travail', type: 'Contrat', date: '2022-09-05' },
  { name: 'Avenant télétravail', type: 'Avenant', date: '2023-04-01' },
  { name: 'Attestation employeur', type: 'Attestation', date: '2026-06-12' },
  { name: 'Certificat mutuelle', type: 'Prévoyance', date: '2026-01-08' },
];

export const myRequests = [
  { id: 'r1', label: 'Congés payés — 22 au 26 sept.', status: 'À valider', date: '2026-09-02' },
  { id: 'r2', label: 'Attestation de travail', status: 'Traité', date: '2026-06-12' },
  { id: 'r3', label: 'Note de frais — déplacement Lyon', status: 'Remboursé', date: '2026-05-20' },
];

export const myWeek = [
  { day: 'Lundi', slots: 'Bureau · 9h00 – 17h30' },
  { day: 'Mardi', slots: 'Télétravail · 9h00 – 17h30' },
  { day: 'Mercredi', slots: 'Bureau · 9h00 – 17h30' },
  { day: 'Jeudi', slots: 'Bureau · 9h00 – 17h30' },
  { day: 'Vendredi', slots: 'Télétravail · 9h00 – 16h00' },
];
