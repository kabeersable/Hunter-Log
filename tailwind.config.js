/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        system: {
          bg: '#07090e',
          card: '#0e131f',
          panel: '#121929',
          border: '#1e293b',
          cyan: '#00f0ff',
          blue: '#3b82f6',
          purple: '#a855f7',
          red: '#ff2a5f',
          gold: '#f59e0b',
          green: '#10b981',
          text: '#e2e8f0',
          muted: '#64748b'
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', '"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
        system: ['"Orbitron"', 'sans-serif']
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0, 240, 255, 0.1)',
        'blue-glow': '0 0 15px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(59, 130, 246, 0.1)',
        'red-glow': '0 0 20px rgba(255, 42, 95, 0.6), inset 0 0 12px rgba(255, 42, 95, 0.2)',
        'purple-glow': '0 0 20px rgba(168, 85, 247, 0.5), inset 0 0 10px rgba(168, 85, 247, 0.15)',
        'gold-glow': '0 0 15px rgba(245, 158, 11, 0.4)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.8), 0 0 5px rgba(255, 255, 255, 0.8)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
