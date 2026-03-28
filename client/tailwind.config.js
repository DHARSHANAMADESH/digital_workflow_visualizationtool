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
        primary: {
          DEFAULT: '#14B8A6',
          hover: '#0D9488',
          light: '#F0FDFA',
        },
        secondary: {
          DEFAULT: '#10B981',
          hover: '#059669',
        },
        background: '#F0FDFA',
        hover: '#0D9488',
        card: '#FFFFFF',
        border: '#E6FFFA',
        content: {
          primary: '#000000',
          secondary: '#374151',
        },
        indigo: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#14B8A6',
          700: '#0D9488',
          900: '#115E59',
        },
        teal: {
          50: '#F0FDFA',
          500: '#14B8A6',
          600: '#0D9488',
        },
        emerald: {
          500: '#10B981',
          600: '#059669',
        },
        brand: {
          primary: '#14B8A6',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          background: '#F0FDFA',
          text: '#000000',
          muted: '#374151',
        }
      }
    },
  },
  plugins: [],
}

