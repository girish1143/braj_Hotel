/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        braj: {
          saffron: '#e05a10',
          'saffron-dark': '#b43f05',
          'saffron-light': '#f97316',
          amber: '#f59e0b',
          marigold: '#fbbf24',
          gold: '#d97706',
          'gold-light': '#fef08a',
          terracotta: '#c2410c',
          kumkum: '#b91c1c',
          peacock: '#0284c7',
          'peacock-deep': '#0369a1',
          forest: '#15803d',
          tulsi: '#16a34a',
          sand: '#fef3c7',
          cream: '#fffaf0',
          ivory: '#fdfbf7',
          dark: '#291b12',
          mahogany: '#1c120c',
          card: '#ffffff'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'Cambria', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'temple': '0 4px 20px -2px rgba(217, 119, 6, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.05)',
        'temple-lg': '0 10px 30px -4px rgba(217, 119, 6, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'gold-glow': '0 0 25px rgba(245, 158, 11, 0.35)',
        'saffron-glow': '0 0 25px rgba(224, 90, 16, 0.35)',
        'peacock-glow': '0 0 25px rgba(2, 132, 199, 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}
