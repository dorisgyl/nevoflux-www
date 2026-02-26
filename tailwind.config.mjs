/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '100%',
        md: '100%',
        lg: '1024px',
        xl: '1280px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: 'var(--nevo-paper)',
        dark: 'var(--nevo-dark)',
        subtle: 'var(--nevo-subtle)',
        muted: 'var(--nevo-muted)',
        accent: 'var(--nevo-accent)',
        'accent-hover': 'var(--nevo-accent-hover)',
        'accent-light': 'var(--nevo-accent-light)',
        glow: 'var(--nevo-glow)',
        surface: 'var(--nevo-surface)',
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-out',
        fadeUp: 'fadeUp 0.8s ease-out',
        glow: 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(26, 107, 107, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(77, 217, 217, 0.4)' },
        },
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '-sm': { max: '639px' },
      '-md': { max: '767px' },
      '-lg': { max: '1023px' },
    },
  },
  plugins: [],
};
