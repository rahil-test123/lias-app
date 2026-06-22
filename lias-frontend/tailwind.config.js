/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B2D4F',
          50:  '#F0F3F8',
          100: '#D6DEF0',
          200: '#ADBDE0',
          300: '#7A97C8',
          400: '#4E72B0',
          500: '#2A4D7A',
          600: '#1B2D4F',
          700: '#152340',
          800: '#0E1A30',
          900: '#08101E',
        },
        amber: {
          DEFAULT: '#D4651A',
          50:  '#FDF4EE',
          100: '#FAE4D0',
          200: '#F4C4A0',
          300: '#ECA06A',
          400: '#E27C3C',
          500: '#D4651A',
          600: '#B55316',
          700: '#8E3F10',
          800: '#662C09',
          900: '#3F1B05',
        },
        cream: {
          DEFAULT: '#F7F5F1',
          50:  '#FDFCFB',
          100: '#F7F5F1',
          200: '#EDE9E2',
          300: '#DDD7CC',
          400: '#C8C0B4',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'page-in':  'pageIn .35s cubic-bezier(.4,0,.2,1) both',
        'slide-up': 'slideUp .45s cubic-bezier(.4,0,.2,1) both',
        'fade-in':  'fadeIn .3s ease both',
        'shimmer':  'shimmer 1.6s infinite',
      },
      keyframes: {
        pageIn:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
    },
  },
  plugins: [],
}
