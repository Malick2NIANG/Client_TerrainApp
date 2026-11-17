/** @type {import('tailwindcss').Config} */
// Identite propre a TerrainApp : titres en Barlow Condensed (esprit
// maillot / tableau d'affichage), texte en DM Sans.
// Couleur de MARQUE configurable (src/config/marque.js) : variables CSS
// --marque* posees au demarrage ; bg-primary/40 et consorts restent valables.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Barlow Condensed"', '"DM Sans"', 'Arial Narrow', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--marque) / <alpha-value>)',
          dark: 'rgb(var(--marque-fonce) / <alpha-value>)',
          light: 'rgb(var(--marque-clair) / <alpha-value>)',
        },
        nuit: 'rgb(var(--marque-nuit) / <alpha-value>)',
        ink: {
          DEFAULT: '#121212',
          light: '#6A6A6A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F4F4F1',
        },
        line: '#E8E8E3',
        success: '#1F6F57',
        danger: {
          DEFAULT: '#B3261E',
          dark: '#8C1D17',
        },
      },
      borderRadius: {
        md: '12px',
        lg: '20px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        float: '0 10px 30px rgba(0,0,0,0.14)',
        recherche: '0 6px 24px rgba(0,0,0,0.16), 0 1px 2px rgba(0,0,0,0.08)',
      },
      maxWidth: {
        app: '640px',
      },
    },
  },
  plugins: [],
};
