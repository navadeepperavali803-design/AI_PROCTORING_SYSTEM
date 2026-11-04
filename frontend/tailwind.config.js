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
        navy: {
          950: '#060913',
          900: '#0B0F19',
          850: '#0F172A',
          800: '#151E32',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        proctor: {
          safe: '#10B981',      // Emerald safe state
          warning: '#F59E0B',   // Amber glancing/movement
          danger: '#EF4444',    // Red violation
          neutral: '#64748B',   // Slate standby
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
