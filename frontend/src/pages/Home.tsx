import { Button, Card, IconBubble, IconEl, SectionTitle, Badge } from '../components/ui';
import { hrModules, billingModules, aiFeatures, testimonials } from '../data/mock';

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-wash blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-rosewash blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-wash blur-3xl" />
      </div>
      <div className="v-container grid items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div className="animate-fade-up">
          <Badge tone="peach">Réforme facturation 2026 · Factur-X + PPF</Badge>
          <h1 className="mt-5 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            L’humain,
            <span className="block v-subtitle text-4xl sm:text-5xl lg:text-6xl">simplement.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-mauve">
            Valentynia réunit vos ressources humaines, votre facturation conforme 2026 et votre
            conformité légale dans une plateforme calme, fluide et premium — avec un assistant
            IA RH qui vous accompagne au quotidien.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/app" icon="ArrowRight">Découvrir la démo entreprise</Button>
            <Button variant="secondary" to="/tarifs">Voir les tarifs</Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-mauve">
            {['Sans engagement', 'RGPD & hébergement France', 'Mise en route en 48 h'].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <IconEl name="Check" size={16} className="text-powder" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-soft-in">
          <Card className="shadow-soft-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-sm text-mauve">Tableau de bord RH</p>
                <p className="font-serif text-xl italic text-prune">Bonjour, Camille</p>
              </div>
              <IconBubble name="Sparkle" tone="powder" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { k: 'Effectif', v: '142' },
                { k: 'Absentéisme', v: '3,1 %' },
                { k: 'Factures PPF', v: '148' },
                { k: 'Conformité', v: '92 %' },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-wash p-4">
                  <p className="font-heading text-xs uppercase tracking-wide text-mauve">{s.k}</p>
                  <p className="v-stat mt-1 text-2xl">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-line bg-wash p-4">
              <p className="flex items-center gap-2 font-heading text-sm text-prune">
                <IconEl name="Sparkle" size={16} className="text-powder" />
                Assistant IA RH
              </p>
              <p className="mt-2 text-sm leading-relaxed text-mauve">
                « Un pic d’absences est probable en semaine 42. Je vous suggère d’anticiper
                un renfort sur l’atelier. »
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Presentation() {
  const pillars = [
    { icon: 'Users' as const, title: 'RH complètes', text: 'Du dossier salarié aux entretiens, chaque brique RH est là, sans surcharge visuelle.' },
    { icon: 'Receipt' as const, title: 'Facturation 2026', text: 'Factur-X, envoi PPF, archivage légal et journal anti-fraude TVA, prêts pour la réforme.' },
    { icon: 'Sparkle' as const, title: 'IA RH intégrée', text: 'Un assistant calme et rassurant qui rédige, analyse, anticipe et recommande.' },
    { icon: 'Shield' as const, title: 'Conformité continue', text: 'Contrats vérifiés, alertes légales, obligations RH et RGPD suivis automatiquement.' },
  ];
  return (
    <section className="v-container py-20">
      <SectionTitle
        center
        eyebrow="Présentation"
        title="Une plateforme unique, pensée pour respirer"
        subtitle="Valentynia rassemble ce qui était éparpillé entre tableurs, prestataires et outils rigides — dans une interface douce que vos équipes ont envie d’ouvrir."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p) => (
          <Card key={p.title} className="transition hover:-translate-y-1 hover:shadow-soft-lg">
            <IconBubble name={p.icon} />
            <h3 className="mt-4 text-lg">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mauve">{p.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ModuleGrid({ id, eyebrow, title, subtitle, modules }: { id: string; eyebrow: string; title: string; subtitle: string; modules: typeof hrModules }) {
  return (
    <section id={id} className="v-container py-20">
      <SectionTitle eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Card key={m.key} className="flex flex-col transition hover:-translate-y-1 hover:shadow-soft-lg">
            <IconBubble name={m.icon} tone="powder" />
            <h3 className="mt-4 text-lg">{m.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mauve">{m.desc}</p>
            <ul className="mt-4 space-y-2 text-sm text-mauve">
              {m.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <IconEl name="Check" size={15} className="mt-0.5 shrink-0 text-powder" />
                  {pt}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section className="v-container py-20">
      <div className="v-card overflow-hidden p-0">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-gradient-to-br from-wash via-wash to-rosewash p-10 lg:p-12">
            <Badge tone="powder">IA RH — incluse</Badge>
            <h2 className="mt-4 text-3xl leading-tight lg:text-4xl">Un assistant qui apaise la charge mentale RH</h2>
            <p className="mt-4 leading-relaxed text-mauve">
              L’IA de Valentynia parle avec calme et professionnalisme. Elle ne remplace pas
              l’humain : elle prépare, éclaire et propose, pour que vous décidiez sereinement.
            </p>
            <Button to="/app/ia" className="mt-8" icon="ArrowRight">Voir l’assistant en action</Button>
          </div>
          <div className="grid gap-4 p-8 sm:grid-cols-2 lg:p-12">
            {aiFeatures.slice(0, 6).map((f) => (
              <div key={f.title} className="rounded-xl bg-wash p-4">
                <IconEl name={f.icon} size={20} className="text-powder" />
                <p className="mt-2 font-heading text-sm font-medium text-prune">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-mauve">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Demo() {
  return (
    <section className="v-container py-20">
      <div className="v-card grid items-center gap-8 bg-wash p-10 text-center lg:p-16">
        <SectionTitle center eyebrow="Démo" title="Essayez Valentynia sans rien installer" subtitle="Parcourez l’espace entreprise et l’espace salarié avec des données de démonstration. Aucune carte bancaire, aucune configuration." />
        <div className="flex flex-wrap justify-center gap-3">
          <Button to="/app" icon="Briefcase">Espace entreprise</Button>
          <Button variant="secondary" to="/espace" icon="User">Espace salarié</Button>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="v-container py-20">
      <SectionTitle center eyebrow="Témoignages" title="Des équipes RH plus sereines" />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.name} className="flex flex-col">
            <IconEl name="Chat" size={22} className="text-powder" />
            <p className="mt-4 flex-1 font-serif text-lg italic leading-relaxed text-prune">“{t.quote}”</p>
            <div className="mt-5">
              <p className="font-heading text-sm font-medium text-prune">{t.name}</p>
              <p className="text-xs text-mauve">{t.role}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="v-container pb-4 pt-8">
      <div className="v-card bg-gradient-to-r from-wash to-rosewash p-10 text-center lg:p-16">
        <h2 className="text-3xl leading-tight lg:text-4xl">Prête à remettre l’humain au centre ?</h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-mauve">
          Rejoignez les entreprises qui ont choisi Valentynia pour aborder la réforme 2026
          l’esprit tranquille.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/connexion" icon="ArrowRight">Créer un compte</Button>
          <Button variant="secondary" to="/tarifs">Comparer les offres</Button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Presentation />
      <ModuleGrid
        id="rh"
        eyebrow="Modules RH"
        title="Toute la fonction RH, sans friction"
        subtitle="Huit modules qui couvrent le cycle de vie du collaborateur, de l’arrivée au départ."
        modules={hrModules}
      />
      <ModuleGrid
        id="facturation"
        eyebrow="Facturation — réforme 2026"
        title="Conforme le jour J, sans stress"
        subtitle="Factur-X, PPF, archivage et anti-fraude : la facturation électronique obligatoire, gérée pour vous."
        modules={billingModules}
      />
      <AISection />
      <Demo />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
