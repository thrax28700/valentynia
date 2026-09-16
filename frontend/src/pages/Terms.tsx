import { LegalPage, LegalSection } from '../components/LegalPage';

export default function Terms() {
  return (
    <LegalPage title="Conditions générales d'utilisation" updated="16 septembre 2026">
      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions régissent l'accès et l'utilisation du site et de l'application de
          démonstration Valentynia (le « Site »). L'utilisation du Site implique l'acceptation pleine et
          entière des présentes conditions.
        </p>
      </LegalSection>

      <LegalSection title="2. Nature de démonstration">
        <p>
          Valentynia est un projet réalisé dans un cadre pédagogique (voir les{' '}
          <a className="underline hover:text-prune" href="/mentions-legales">mentions légales</a>) et ne
          constitue pas un service commercial. L'accès à l'espace entreprise et à l'espace salarié se fait
          exclusivement via des <strong>comptes de démonstration</strong> fournis sur la page de connexion :
          aucune inscription publique de compte réel n'est proposée.
        </p>
      </LegalSection>

      <LegalSection title="3. Données affichées">
        <p>
          L'ensemble des entreprises, salariés, absences, factures, montants et échanges avec l'assistant
          IA affichés dans l'application sont des <strong>données fictives</strong> créées à des fins de
          démonstration. Aucune donnée réelle de salarié ou d'entreprise n'est traitée.
        </p>
      </LegalSection>

      <LegalSection title="4. Disponibilité et responsabilité">
        <p>
          Le Site est hébergé sur des offres d'hébergement gratuites : l'API peut se mettre en veille après
          une période d'inactivité et nécessiter jusqu'à une minute pour redémarrer lors d'un accès suivant.
          Aucune garantie de disponibilité, de performance ou de continuité de service (SLA) n'est accordée.
          L'éditeur ne pourra être tenu responsable d'une indisponibilité temporaire ou d'une perte de
          données de démonstration.
        </p>
      </LegalSection>

      <LegalSection title="5. Assistant IA">
        <p>
          L'assistant conversationnel intégré à l'application repose actuellement sur des réponses générées
          localement par des règles prédéfinies, et non sur un fournisseur de modèle de langage tiers. Ses
          réponses sont fournies à titre illustratif et ne constituent pas un conseil RH, juridique ou
          fiscal.
        </p>
      </LegalSection>

      <LegalSection title="6. Propriété intellectuelle">
        <p>
          Le contenu du Site (code, textes, charte graphique) est protégé conformément aux mentions légales.
          Toute reproduction à des fins commerciales est interdite sans accord préalable.
        </p>
      </LegalSection>

      <LegalSection title="7. Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. Pour toute question, contactez{' '}
          <a className="underline hover:text-prune" href="mailto:vaillant.r78@gmail.com">vaillant.r78@gmail.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
