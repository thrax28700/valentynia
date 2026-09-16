import { LegalPage, LegalSection } from '../components/LegalPage';

export default function Privacy() {
  return (
    <LegalPage title="Politique de confidentialité" updated="16 septembre 2026">
      <LegalSection title="Préambule">
        <p>
          Cette page décrit, de façon transparente, les données réellement traitées par le site de
          démonstration Valentynia. Le site n'ayant pas d'inscription publique, très peu de données
          personnelles réelles sont concernées — voir le détail ci-dessous.
        </p>
      </LegalSection>

      <LegalSection title="Données de démonstration (fictives)">
        <p>
          Les salariés, entreprises, IBAN, numéros de sécurité sociale et factures visibles dans
          l'application sont des <strong>données fictives</strong>, créées pour la démonstration. Elles ne
          concernent aucune personne réelle. Elles sont néanmoins chiffrées au repos (AES-256-GCM) et
          transmises en TLS, pour illustrer les mesures de sécurité attendues d'une vraie application RH.
        </p>
      </LegalSection>

      <LegalSection title="Données réellement collectées">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Jeton de session</strong> : lors d'une connexion avec un compte de démonstration, un
            jeton JWT est stocké dans le <code className="mono">localStorage</code> de votre navigateur pour
            maintenir la session. Il n'est jamais transmis à un tiers.
          </li>
          <li>
            <strong>Journaux techniques des hébergeurs</strong> : comme tout site web, les serveurs
            (Netlify, Render) enregistrent de façon standard l'adresse IP et l'horodatage des requêtes, à
            des fins de sécurité et de fonctionnement technique.
          </li>
          <li>
            <strong>Aucun cookie de mesure d'audience ou publicitaire</strong> n'est déposé par
            l'application elle-même.
          </li>
        </ul>
        <p>
          Le site ne proposant pas d'inscription publique, aucune donnée d'identité (nom, e-mail réel,
          mot de passe personnel) n'est collectée auprès des visiteurs testant l'application avec les
          comptes de démonstration fournis.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit
          d'accès, de rectification, d'effacement et d'opposition sur les données vous concernant que ce
          site pourrait traiter (par exemple si vous nous contactez par e-mail). Pour l'exercer, écrivez à{' '}
          <a className="underline hover:text-prune" href="mailto:vaillant.r78@gmail.com">vaillant.r78@gmail.com</a>.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative à cette politique, contactez{' '}
          <a className="underline hover:text-prune" href="mailto:vaillant.r78@gmail.com">vaillant.r78@gmail.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
