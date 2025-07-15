/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ff',
          100: '#fceeff',
          200: '#f8d7fe',
          300: '#f0b7fc',
          400: '#e487f7',
          500: '#d946ef', // Hot Pink
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        hotpink: {
          50: '#fff0f8',
          100: '#ffe2f1',
          200: '#ffc6e3',
          300: '#ff9fd0',
          400: '#ff69b4', // Main Hot Pink
          500: '#ff1493', // Deep Pink
          600: '#e61e7d',
          700: '#c21659',
          800: '#a11447',
          900: '#85123d',
        },
        accent: {
          50: '#fff1f5',
          100: '#ffe4ec',
          200: '#ffb3d1',
          300: '#ff80b5',
          400: '#ff4d99',
          500: '#ff007f', // Bright Pink
          600: '#e6006b',
          700: '#cc0057',
          800: '#b30043',
          900: '#99002f',
        }
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'prata': ['Prata', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(255, 105, 180, 0.08)',
        'medium': '0 4px 25px rgba(255, 105, 180, 0.12)',
        'strong': '0 8px 35px rgba(255, 105, 180, 0.15)',
        'glow': '0 0 20px rgba(255, 105, 180, 0.3)',
        'inner-soft': 'inset 0 2px 4px rgba(255, 105, 180, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      }
    },
  },
  plugins: [],
}