import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <img src="/valentynia.svg" alt="" className="h-14 w-14" />
      <p className="mt-6 font-mono text-5xl text-prune">404</p>
      <h1 className="mt-3 text-2xl">Cette page s’est éclipsée en douceur</h1>
      <p className="mt-2 max-w-sm text-sm text-mauve">
        Le lien que vous avez suivi n’existe pas ou a été déplacé.
      </p>
      <Button to="/" className="mt-8" icon="Home">Revenir à l’accueil</Button>
    </div>
  );
}
