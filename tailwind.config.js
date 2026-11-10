/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#080B14',
        surface: {
          DEFAULT: '#11182A',
          secondary: '#171F35',
          tertiary: '#1E294B',
          card: 'rgba(17, 24, 42, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-bright': 'rgba(255, 255, 255, 0.16)'
        },
        electric: {
          DEFAULT: '#4568FF',
          hover: '#3754E0',
          glow: 'rgba(69, 104, 255, 0.35)',
          light: '#6B87FF',
        },
        violet: {
          DEFAULT: '#7855E8',
          hover: '#6642D6',
          glow: 'rgba(120, 85, 232, 0.35)',
          light: '#8F70F0',
        },
        lavender: {
          DEFAULT: '#A48AFF',
          hover: '#9374F5',
        },
        text: {
          primary: '#F5F6FA',
          secondary: '#929CB3',
          muted: '#626C84',
          accent: '#C4D1EB',
        },
        status: {
          success: '#45D6A0',
          'success-bg': 'rgba(69, 214, 160, 0.12)',
          warning: '#F5B85C',
          'warning-bg': 'rgba(245, 184, 92, 0.12)',
          danger: '#FF5757',
          'danger-bg': 'rgba(255, 87, 87, 0.12)',
          info: '#38BDF8',
          'info-bg': 'rgba(56, 189, 248, 0.12)',
          purple: '#A855F7',
          'purple-bg': 'rgba(168, 85, 247, 0.12)',
        },
        cyan: {
          neon: '#00F0FF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-electric': '0 0 25px -5px rgba(69, 104, 255, 0.45)',
        'glow-violet': '0 0 25px -5px rgba(120, 85, 232, 0.45)',
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.35)',
        'glow-sm': '0 0 12px -2px rgba(69, 104, 255, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'surface-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
