/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: electric blue → indigo
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Accent: violet/purple
        accent: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // Cyan highlight
        glow: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        // Surfaces: deep midnight navy
        surface: {
          DEFAULT: '#050714',
          card:    '#090d1f',
          border:  'rgba(59,130,246,0.12)',
          muted:   '#0f1630',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow':        'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(59,130,246,0.22), transparent)',
        'card-glow':        'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.08), transparent)',
        'blue-purple-grad': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      },
      animation: {
        'slide-up':       'slideUp 0.45s cubic-bezier(0.22,1,0.36,1)',
        'fade-in':        'fadeIn 0.5s ease-out',
        'pulse-glow':     'pulseGlow 3s ease-in-out infinite',
        'shimmer':        'shimmer 2.5s linear infinite',
        'float':          'float 6s ease-in-out infinite',
      },
      keyframes: {
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1)' },
          '50%':      { boxShadow: '0 0 40px rgba(59,130,246,0.6), 0 0 80px rgba(59,130,246,0.2)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'blue-glow':   '0 0 24px rgba(59,130,246,0.35), 0 0 80px rgba(59,130,246,0.1)',
        'blue-glow-lg':'0 0 48px rgba(59,130,246,0.45), 0 0 120px rgba(59,130,246,0.15)',
        'card':        '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
};
