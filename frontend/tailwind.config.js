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
        cyber: {
          bg: '#070b14',
          card: '#0d1527',
          surface: '#111c35',
          border: '#1e293b',
          glow: '#06b6d4',
          accent: '#3b82f6',
          purple: '#8b5cf6',
          safe: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.25)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.25)',
        'glow-safe': '0 0 25px -5px rgba(16, 185, 129, 0.25)'
      }
    },
  },
  plugins: [],
}
