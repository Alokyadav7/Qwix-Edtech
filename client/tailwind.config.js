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
          950: "#020B18",
          900: "#061425",
          800: "#0D2137",
          700: "#0F2D4F",
          600: "#163D6A",
        },
        electric: {
          500: "#0EA5E9",
          400: "#38BDF8",
          300: "#7DD3FC",
        },
        violet: {
          500: "#8B5CF6",
          400: "#A78BFA",
          300: "#C4B5FD",
        },
        neon: {
          500: "#10B981",
          400: "#34D399",
        },
        amber: {
          500: "#F59E0B",
          400: "#FBBF24",
        },
        coral: {
          500: "#F43F5E",
          400: "#FB7185",
        },
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['Satoshi', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      screens: {
        xs: '475px',
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite linear',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
