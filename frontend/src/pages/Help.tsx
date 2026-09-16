import { Card, SectionTitle, Badge, IconEl, IconBubble } from '../components/ui';

const accounts = [
  { role: 'Entreprise (admin)', email: 'camille.ferrand@atelier-lumen.fr', tone: 'gold' as const },
  { role: 'RH', email: 'sofia.renault@atelier-lumen.fr', tone: 'gold' as const },
  { role: 'Salarié', email: 'yanis.moreau@atelier-lumen.fr', tone: 'teal' as const },
];

const companyModules = [
  { tone: 'gold' as const, group: 'Ressources humaines', items: [
    ['Vue globale', 'Effectif, absences en attente, encours de facturation et conformité, en un coup d’œil.'],
    ['Salariés', 'Dossiers salariés : contrat, poste, coordonnées, données sensibles chiffrées.'],
    ['Absences / congés', 'Poser, valider ou refuser une demande ; soldes calculés automatiquement.'],
    ['Planning / temps', 'Vue hebdomadaire des équipes, télétravail et présentiel.'],
    ['On / Offboarding', 'Suivi des parcours d’intégration avec checklist type.'],
    ['Documents RH', 'Coffre-fort de documents et modèles.'],
    ['Entretiens', 'Campagnes d’entretiens annuels et professionnels.'],
    ['Compétences', 'Cartographie des compétences par salarié.'],
  ] },
  { tone: 'orange' as const, group: 'Finance & conformité', items: [
    ['Facturation 2026', 'Créer une facture Factur-X, suivre son statut PPF, consulter le journal anti-fraude TVA.'],
    ['Conformité légale', 'Alertes réglementaires, vérification automatique de clauses de contrat, registre RGPD.'],
  ] },
  { tone: 'violet' as const, group: 'Intelligence', items: [
    ['Assistant IA RH', 'Assistant conversationnel, génération de documents, analyses agrégées et anonymes.'],
  ] },
  { tone: 'teal' as const, group: 'Entreprise', items: [
    ['Paramètres', 'Informations de l’entreprise, offre en cours.'],
  ] },
];

const employeeModules = [
  { tone: 'gold' as const, group: 'Ressources humaines', items: [
    ['Accueil', 'Résumé personnel : solde de congés, prochains événements, accès rapide à l’assistant.'],
    ['Documents', 'Vos documents personnels et modèles RH.'],
    ['Bulletins', 'Historique et téléchargement de vos bulletins de paie.'],
    ['Demandes', 'Déposer une demande (congé, remboursement…) et suivre son statut.'],
    ['Planning', 'Votre planning personnel.'],
  ] },
  { tone: 'violet' as const, group: 'Intelligence', items: [
    ['Assistant IA', 'Poser une question RH, 24h/24, en toute confidentialité.'],
  ] },
  { tone: 'teal' as const, group: 'Entreprise', items: [
    ['Profil', 'Vos informations personnelles (IBAN affiché masqué).'],
  ] },
];

function ModuleList({ groups }: { groups: typeof companyModules }) {
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.group}>
          <p className="font-heading text-xs font-semibold uppercase tracking-wider text-mauve">{g.group}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {g.items.map(([name, desc]) => (
              <div key={name} className="flex gap-3 rounded-xl border border-line p-3">
                <IconBubble name="Check" tone={g.tone} />
                <div>
                  <p className="font-heading text-sm font-medium text-prune">{name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-mauve">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Help() {
  return (
    <div className="v-container max-w-4xl py-16">
      <SectionTitle
        eyebrow="Guide"
        title="Guide d'utilisation"
        subtitle="Tout ce qu'il faut pour prendre en main Valentynia en quelques minutes — espace entreprise comme espace salarié."
      />

      <Card className="mt-10">
        <h2 className="text-lg">1. Se connecter</h2>
        <p className="mt-2 text-sm leading-relaxed text-mauve">
          Rendez-vous sur <code className="mono">/connexion</code>, choisissez l'onglet « Entreprise » ou
          « Salarié », puis utilisez l'un des comptes de démonstration ci-dessous (mot de passe identique
          pour tous : <code className="mono">demo1234</code>).
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-mauve">
                <th className="px-3 py-2 font-heading font-medium">Rôle</th>
                <th className="px-3 py-2 font-heading font-medium">Identifiant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {accounts.map((a) => (
                <tr key={a.email}>
                  <td className="px-3 py-2"><Badge tone={a.tone}>{a.role}</Badge></td>
                  <td className="px-3 py-2 font-mono text-xs text-prune">{a.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg">2. Espace entreprise</h2>
        <p className="mt-2 text-sm leading-relaxed text-mauve">
          Chaque domaine a sa couleur dans la barre latérale : doré pour les RH, orange pour la finance et
          la conformité, violet pour l'assistant IA, turquoise pour les paramètres.
        </p>
        <div className="mt-4">
          <ModuleList groups={companyModules} />
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg">3. Espace salarié</h2>
        <p className="mt-2 text-sm leading-relaxed text-mauve">
          Depuis l'espace entreprise, le lien « Voir l'espace salarié » en bas de la barre latérale permet
          de basculer sans se reconnecter.
        </p>
        <div className="mt-4">
          <ModuleList groups={employeeModules} />
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg">4. Limites connues de la démo</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mauve">
          <li className="flex gap-2"><IconEl name="Clock" size={16} className="mt-0.5 shrink-0 text-mauve" />Le service gratuit peut se mettre en veille après 15 min d'inactivité : la première action peut prendre 30 à 50 secondes.</li>
          <li className="flex gap-2"><IconEl name="Sparkle" size={16} className="mt-0.5 shrink-0 text-violet" />L'assistant IA répond aujourd'hui à partir de règles prédéfinies, pas d'un modèle de langage externe.</li>
          <li className="flex gap-2"><IconEl name="Receipt" size={16} className="mt-0.5 shrink-0 text-orange" />La transmission au Portail Public de Facturation est simulée (les accès de production ne sont pas encore fournis).</li>
          <li className="flex gap-2"><IconEl name="Users" size={16} className="mt-0.5 shrink-0 text-gold" />Toutes les données (salariés, factures, montants) sont fictives.</li>
        </ul>
      </Card>

      <Card className="mt-6 bg-wash">
        <h2 className="text-lg">5. Donner votre retour</h2>
        <p className="mt-2 text-sm leading-relaxed text-mauve">
          Vos remarques nous intéressent particulièrement sur : la clarté des écrans, ce qui manque pour
          votre usage RH quotidien, et tout point bloquant ou confus. Écrivez à{' '}
          <a className="underline hover:text-prune" href="mailto:vaillant.r78@gmail.com">vaillant.r78@gmail.com</a>.
        </p>
      </Card>
    </div>
  );
}
