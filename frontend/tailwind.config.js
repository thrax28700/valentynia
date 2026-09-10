/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Valentynia — neutre chaud + un seul accent rose
        cream: '#FAF9F8', // fond de page (blanc cassé chaud)
        wash: '#F2EFEC', // remplissage subtil : tuiles, hover, onglets, lignes de tableau
        line: '#E9E5E2', // bordures & séparateurs (hairline)
        prune: '#232022', // texte courant + titres (anthracite chaud)
        mauve: '#6E655C', // texte secondaire (gris chaud)
        powder: '#C25A76', // accent rose — boutons principaux, liens, état actif, icônes clés
        powderdark: '#AB4A64', // hover de l'accent
        rosewash: '#F7E9ED', // fond rose très clair — badges, surbrillance
        peach: '#F2EFEC', // (déprécié — repointé sur le neutre)
        sage: '#D8E7DE', // succès / validation uniquement
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
