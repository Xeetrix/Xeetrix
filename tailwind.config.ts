import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#0a0a0d',
        border: 'rgba(255,255,255,0.1)',
        'cyber-blue': '#0070F3',
        'electric-purple': '#7928CA',
        muted: '#9aa1ac',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'radial-fade':
          'radial-gradient(60% 60% at 50% 0%, rgba(0,112,243,0.18) 0%, rgba(121,40,202,0.12) 45%, transparent 80%)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      boxShadow: {
        glow: '0 0 60px -10px rgba(0,112,243,0.55)',
        'glow-purple': '0 0 60px -10px rgba(121,40,202,0.55)',
        'inner-line': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
        'inner-border': 'inset 0 0 0 1px rgba(255,255,255,0.09)',
        hardware:
          'inset 0 0 0 1px rgba(255,255,255,0.09), inset 0 1px 0 0 rgba(255,255,255,0.14), 0 40px 80px -30px rgba(0,0,0,0.6)',
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'marquee-reverse': 'marquee-reverse 32s linear infinite',
        'spin-slow': 'spin 14s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        aurora: 'aurora 18s ease-in-out infinite',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        grain: 'grain 8s steps(10) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, -6%) scale(1.05)' },
          '66%': { transform: 'translate(-3%, 4%) scale(0.98)' },
        },
        'border-beam': {
          '100%': { 'offset-distance': '100%' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-1%, -3%)' },
          '20%': { transform: 'translate(-3%, 1%)' },
          '30%': { transform: 'translate(2%, -6%)' },
          '40%': { transform: 'translate(-1%, 4%)' },
          '50%': { transform: 'translate(-3%, 2%)' },
          '60%': { transform: 'translate(4%, 0%)' },
          '70%': { transform: 'translate(0%, 5%)' },
          '80%': { transform: 'translate(-2%, -2%)' },
          '90%': { transform: 'translate(3%, -1%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
