/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hodhod: {
          gold: '#D4AF37',
          'gold-light': '#F4E4BC',
          'gold-dark': '#B8860B',
          black: '#1A1A1A',
          'black-light': '#2D2D2D',
          white: '#FFFFFF',
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          }
        }
      },
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
        'arabic': ['Cairo', 'Tajawal', 'sans-serif'],
        'english': ['Open Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'hodhod': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'hodhod-lg': '0 10px 40px rgba(0, 0, 0, 0.12)',
        'hodhod-gold': '0 4px 20px rgba(212, 175, 55, 0.15)',
      },
      borderRadius: {
        'hodhod': '16px',
        'hodhod-lg': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
        },
      },
    },
  },
  plugins: [],
}
