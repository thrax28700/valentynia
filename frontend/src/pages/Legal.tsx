import { LegalPage, LegalSection } from '../components/LegalPage';

export default function Legal() {
  return (
    <LegalPage title="Mentions légales" updated="16 septembre 2026">
      <LegalSection title="Nature du site">
        <p>
          Valentynia est un projet de démonstration réalisé par <strong>Renaud Vaillant</strong> dans le
          cadre de la préparation du titre professionnel <strong>Développeur Web et Web Mobile (DWWM)</strong>.
          Il ne s'agit pas d'une société commerciale immatriculée : les entreprises, salariés, factures et
          montants affichés dans l'application sont des données fictives de démonstration.
        </p>
      </LegalSection>

      <LegalSection title="Éditeur">
        <p>
          Responsable de la publication : Renaud Vaillant.
          <br />
          Contact : <a className="underline hover:text-prune" href="mailto:vaillant.r78@gmail.com">vaillant.r78@gmail.com</a>
          <br />
          Code source :{' '}
          <a className="underline hover:text-prune" href="https://github.com/thrax28700/valentynia" target="_blank" rel="noreferrer">
            github.com/thrax28700/valentynia
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Interface (frontend)</strong> — Netlify, Inc. (États-Unis) — netlify.com</li>
          <li><strong>API</strong> — Render Services, Inc., région Francfort, Allemagne — render.com</li>
          <li><strong>Base de données</strong> — Neon, région Europe (Londres, Royaume-Uni) — neon.tech</li>
        </ul>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          Sauf mention contraire dans le dépôt GitHub, l'ensemble du code, des textes et de la charte
          graphique de ce site est la propriété de son auteur. Aucune licence open source n'est actuellement
          accordée sur le dépôt.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          Ce site est un projet de démonstration réalisé dans un cadre pédagogique, mis à disposition sans
          garantie de disponibilité, d'exactitude ou de continuité de service. Voir les{' '}
          <a className="underline hover:text-prune" href="/cgu">Conditions Générales d'Utilisation</a> pour le détail.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
