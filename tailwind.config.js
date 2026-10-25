/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#090d16',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155'
        },
        brand: {
          500: '#06b6d4',
          600: '#0891b2',
          glow: 'rgba(6, 182, 212, 0.25)'
        }
      }
    },
  },
  plugins: [],
};
