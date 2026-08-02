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
        gfg: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#2f9e44',
          600: '#238636',
          700: '#1b5e20',
          800: '#144718',
          900: '#0d2e10',
          dark: '#0d1117',
          card: '#161b22',
          border: '#30363d'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
