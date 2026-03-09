import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: '#FF0033',
        violet: '#8B00FF',
        'violet-light': '#A855F7',
        bg: '#0a0a0f',
        surface: 'rgba(255,255,255,0.05)',
        'surface-hover': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(255,0,51,0.4)',
        violet: '0 0 20px rgba(139,0,255,0.4)',
        glass: '0 8px 32px rgba(0,0,0,0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,0,51,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255,0,51,0.8), 0 0 60px rgba(255,0,51,0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'glow': {
          from: { textShadow: '0 0 10px rgba(255,0,51,0.5)' },
          to: { textShadow: '0 0 20px rgba(255,0,51,1), 0 0 40px rgba(255,0,51,0.5)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
