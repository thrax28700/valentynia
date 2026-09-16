/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Valentynia — fond blanc + accent corail + une couleur par module
        cream: '#FFFFFF', // fond de page (blanc)
        wash: '#F4F3F2', // remplissage subtil : tuiles, hover, onglets, lignes de tableau
        line: '#E9E5E2', // bordures & séparateurs (hairline)
        prune: '#211F21', // texte courant + titres (anthracite)
        mauve: '#6E655C', // texte secondaire (gris chaud)
        powder: '#E9435A', // accent principal (corail) — boutons, liens, état actif
        powderdark: '#CC3349', // hover de l'accent principal
        rosewash: '#FBE6EA', // fond corail très clair — badges, surbrillance
        peach: '#F4F3F2', // (déprécié — repointé sur le neutre)
        sage: '#D8E7DE', // succès / validation uniquement

        // Couleurs de module (une par domaine applicatif)
        gold: '#F0B429', // Ressources humaines
        golddark: '#D69E1D',
        goldwash: '#FBF1D6',
        orange: '#F2762E', // Finance & conformité (facturation, conformité légale)
        orangedark: '#D9631F',
        orangewash: '#FDE7D8',
        violet: '#6C2E90', // Intelligence (assistant IA)
        violetdark: '#5A2478',
        violetwash: '#EFE1F5',
        teal: '#2FB1C7', // Entreprise / paramètres / site vitrine (accent secondaire)
        tealdark: '#268FA1',
        tealwash: '#DEF3F6',
      },
      fontFamily: {
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem', // 12px — inputs, tuiles
        '2xl': '1rem', // 16px — cartes
        '3xl': '1.25rem', // 20px
      },
      boxShadow: {
        // Ombres crisp et discrètes (look SaaS)
        soft: '0 1px 2px rgba(35, 32, 34, 0.04), 0 4px 16px -6px rgba(35, 32, 34, 0.08)',
        'soft-lg': '0 2px 4px rgba(35, 32, 34, 0.04), 0 16px 40px -12px rgba(35, 32, 34, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'soft-in': 'soft-in 0.8s ease-out both',
      },
    },
  },
  plugins: [],
};
