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
          primary: '#FF4500', // OrangeRed
          secondary: '#8A2BE2', // BlueViolet
          accent: '#00FFFF', // Cyan
          dark_bg: '#1A1A2E',
          dark_card: '#0F3460',
          light_text: '#E0E0E0',
          dark_text: '#171717',
        },
        fontFamily: {
          sans: ['"Press Start 2P"', 'cursive'],
          mono: ['"Press Start 2P"', 'cursive'],
        },
        backgroundImage: {
          'game-pattern': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230f3460' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
        },
        keyframes: {
          laugh: {
            '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
            '25%': { transform: 'scale(1.2) rotate(10deg)' },
            '50%': { transform: 'scale(1.2) rotate(-10deg)' },
            '75%': { transform: 'scale(1.2) rotate(10deg)' },
          },
          shine: {
            '0%, 100%': { opacity: '0.7', filter: 'brightness(1)' },
            '50%': { opacity: '1', filter: 'brightness(1.5)' },
          },
          shake: {
            '0%, 100%': { transform: 'translateX(0)' },
            '20%, 60%': { transform: 'translateX(-5px)' },
            '40%, 80%': { transform: 'translateX(5px)' },
          },
          bounce: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          pulse: {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
          },
          'spin-fast': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
          tada: {
            '0%': { transform: 'scale(1)' },
            '10%, 20%': { transform: 'scale(0.9) rotate(-3deg)' },
            '30%, 50%, 70%, 90%': { transform: 'scale(1.1) rotate(3deg)' },
            '40%, 60%, 80%': { transform: 'scale(1.1) rotate(-3deg)' },
            '100%': { transform: 'scale(1) rotate(0)' },
          },
          rocket: {
            '0%': { transform: 'translateY(0) rotate(0deg)' },
            '50%': { transform: 'translateY(-50px) rotate(15deg)' },
            '100%': { transform: 'translateY(0) rotate(0deg)' },
          },
          jiggle: {
            '0%, 100%': { transform: 'rotate(0deg)' },
            '25%': { transform: 'rotate(-5deg)' },
            '50%': { transform: 'rotate(5deg)' },
            '75%': { transform: 'rotate(-5deg)' },
          },
          target: {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.2)', filter: 'brightness(1.5)' },
          },
          score: {
            '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
            '100%': { transform: 'translateY(-20px) scale(1.2)', opacity: '0' },
          },
          'star-eye': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1) rotate(20deg)' },
          },
        },
        animation: {
          laugh: 'laugh 1s ease-in-out',
          shine: 'shine 1s ease-in-out',
          shake: 'shake 1s ease-in-out',
          bounce: 'bounce 0.5s ease-in-out',
          pulse: 'pulse 1s ease-in-out',
          'spin-fast': 'spin-fast 0.5s linear infinite',
          tada: 'tada 1s ease-in-out',
          rocket: 'rocket 1s ease-in-out',
          jiggle: 'jiggle 1s ease-in-out',
          target: 'target 1s ease-in-out',
          score: 'score 1s ease-in-out',
          'star-eye': 'star-eye 1s ease-in-out',
        },
      },
    },
    plugins: [],
  }