import type { IconName } from '../lib/icons';

/** Contenu éditorial du site vitrine (aucune donnée applicative ici). */

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
