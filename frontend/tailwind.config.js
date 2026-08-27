/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          accent: '#F97316',
          fire: '#EF4444',
          flare: '#F59E0B',
          wildfire: '#10B981',
          agri: '#84CC16',
          mine: '#8B5CF6',
          unknown: '#6B7280'
        }
      }
    },
  },
  plugins: [],
}
