import { Button, Card, IconEl, SectionTitle, Badge, cx } from '../components/ui';
import { eur } from '../lib/format';
import { pricingPlans, premiumOptions } from '../data/content';

const faq = [
  { q: 'La facturation Factur-X est-elle vraiment incluse ?', a: 'Oui. La génération Factur-X (PDF/A-3 + XML) est incluse dès l’offre Essentiel. L’envoi au PPF et l’archivage légal 10 ans sont inclus à partir de Business.' },
  { q: 'Puis-je changer d’offre en cours d’année ?', a: 'À tout moment. La facturation est ajustée au prorata, sans frais de changement.' },
  { q: 'Où sont hébergées les données ?', a: 'En France, chez un hébergeur certifié. Chiffrement AES-256 au repos et TLS en transit.' },
  { q: 'L’assistant IA a-t-il accès aux données individuelles ?', a: 'L’analyse du moral et des signaux faibles est strictement anonyme et agrégée. Aucune réponse individuelle n’est exposée.' },
];

export default function Pricing() {
  return (
    <div className="v-container py-20">
      <SectionTitle
        center
        eyebrow="Tarifs"
        title="Des offres claires, sans mauvaise surprise"
        subtitle="Un prix par salarié et par mois. Tous les modules RH essentiels dès la première offre, la facturation 2026 complète à partir de Business."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((p) => (
          <Card
            key={p.name}
            className={cx(
              'flex flex-col',
              p.highlight && 'border-powder/50 shadow-soft-lg ring-1 ring-powder/30',
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl">{p.name}</h3>
              {p.highlight && <Badge tone="powder">Le plus choisi</Badge>}
            </div>
            <p className="mt-1 text-sm text-mauve">{p.tagline}</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="font-mono text-4xl font-medium text-prune">
                {p.price === null ? 'Sur devis' : eur.format(p.price)}
              </span>
              {p.price !== null && <span className="pb-1 text-sm text-mauve">{p.unit}</span>}
            </div>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-mauve">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <IconEl name="Check" size={16} className="mt-0.5 shrink-0 text-powder" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              to="/connexion"
              variant={p.highlight ? 'primary' : 'secondary'}
              className="mt-8 w-full"
            >
              {p.cta}
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg">Options premium</h3>
          <p className="mt-1 text-sm text-mauve">À activer selon vos besoins, sur toutes les offres.</p>
          <ul className="mt-5 space-y-3 text-sm text-mauve">
            {premiumOptions.map((o) => (
              <li key={o} className="flex items-start gap-2">
                <IconEl name="Sparkle" size={16} className="mt-0.5 shrink-0 text-powder" />
                {o}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="bg-wash">
          <h3 className="text-lg">Tous les modules inclus, quelle que soit l’offre</h3>
          <div className="mt-5 grid grid-cols-2 gap-2 text-sm text-mauve">
            {['Dossier salarié', 'Absences / congés', 'Planning', 'Documents RH', 'Portail salarié', 'Factur-X', 'Conformité légale', 'Assistant IA (Business+)'].map((m) => (
              <span key={m} className="flex items-center gap-2">
                <IconEl name="Check" size={15} className="shrink-0 text-powder" />
                {m}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="mx-auto mt-20 max-w-3xl">
        <SectionTitle center title="Questions fréquentes" />
        <div className="mt-8 space-y-3">
          {faq.map((f) => (
            <details key={f.q} className="v-card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-sm font-medium text-prune">
                {f.q}
                <IconEl name="Plus" size={18} className="text-mauve transition group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-mauve">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-16 v-card bg-gradient-to-r from-wash to-rosewash p-10 text-center">
        <h2 className="text-2xl lg:text-3xl">Un doute sur l’offre adaptée ?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-mauve">
          Nos équipes vous aident à cadrer votre passage à la réforme 2026 en 30 minutes.
        </p>
        <Button to="/connexion" className="mt-6" icon="ArrowRight">Parler à un expert</Button>
      </div>
    </div>
  );
}
