import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F2F1F0',
        surface: '#F7F6F8',
        cyan: {
          DEFAULT: '#15BCDF',
          hover: '#3FD0EF',
          edge: '#0FA3C2',
        },
        ink: '#1A1C1E',
        heading: '#2B3033',
        nav: '#3A3A3A',
        body: '#6B6F72',
        line: 'rgba(43,48,51,0.12)',
        'line-soft': 'rgba(43,48,51,0.08)',
      },
      fontFamily: {
        sans: ['var(--font-quantico)', 'Quantico', 'Arial Narrow', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        tech: '0.14em',
        label: '0.18em',
        nav: '0.06em',
      },
      maxWidth: {
        shell: '1560px',
      },
      transitionTimingFunction: {
        tech: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
