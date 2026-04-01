/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary
        'primary': '#b4c5ff',
        'primary-container': '#6c8ef5',
        'primary-fixed': '#dbe1ff',
        'primary-fixed-dim': '#b4c5ff',
        'on-primary': '#002979',
        'on-primary-container': '#00256f',
        'on-primary-fixed': '#00174c',
        'on-primary-fixed-variant': '#103ea3',
        'inverse-primary': '#3258bc',

        // Secondary
        'secondary': '#bdc7da',
        'secondary-container': '#3d4757',
        'secondary-fixed': '#d9e3f7',
        'secondary-fixed-dim': '#bdc7da',
        'on-secondary': '#273140',
        'on-secondary-container': '#acb6c8',
        'on-secondary-fixed': '#121c2a',
        'on-secondary-fixed-variant': '#3d4757',

        // Tertiary
        'tertiary': '#c1c7cf',
        'tertiary-container': '#8d949b',
        'tertiary-fixed': '#dde3eb',
        'tertiary-fixed-dim': '#c1c7cf',
        'on-tertiary': '#2b3137',
        'on-tertiary-container': '#262d33',
        'on-tertiary-fixed': '#161c22',
        'on-tertiary-fixed-variant': '#41474e',

        // Error
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',

        // Surface hierarchy
        'surface': '#111319',
        'surface-dim': '#111319',
        'surface-bright': '#373940',
        'surface-variant': '#33343b',
        'surface-tint': '#b4c5ff',
        'surface-container-lowest': '#0c0e14',
        'surface-container-low': '#191b22',
        'surface-container': '#1e1f26',
        'surface-container-high': '#282a30',
        'surface-container-highest': '#33343b',

        // On-surface
        'on-surface': '#e2e2eb',
        'on-surface-variant': '#c4c6d5',
        'on-background': '#e2e2eb',
        'background': '#111319',

        // Outline
        'outline': '#8e909e',
        'outline-variant': '#434652',

        // Inverse
        'inverse-surface': '#e2e2eb',
        'inverse-on-surface': '#2e3037',
      },
      fontFamily: {
        headline: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
        label: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [],
};
