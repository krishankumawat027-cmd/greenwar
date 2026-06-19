/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Carbon dark theme palette
        'carbon-dark': '#0f172a',
        'carbon-gray': '#1e293b',
        'carbon-light': '#334155',
        // Bumped from #64748b to #94a3b8 for WCAG AA contrast (4.6:1 on dark bg)
        'carbon-muted': '#94a3b8',
        // Accent colours
        'emerald': '#10b981',
        'emerald-dark': '#059669',
        'war-red': '#f43f5e',
        'war-amber': '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease forwards',
        'fade-in': 'fadeIn 0.2s ease forwards',
        'bounce-once': 'bounce-once 0.5s ease',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-once': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
