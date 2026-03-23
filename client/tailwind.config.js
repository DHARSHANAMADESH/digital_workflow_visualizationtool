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
        indigo: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        brand: {
          primary: '#6366F1',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          background: '#F8FAFC',
          text: '#0F172A',
          muted: '#64748B',
        }
      }
    },
  },
  plugins: [],
}

