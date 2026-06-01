/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          bg: '#050816',
          navy: '#0B1120',
          blue: '#4F9CF9',
          purple: '#8B5CF6',
          cyan: '#22D3EE',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(135deg, #4F9CF9, #8B5CF6)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shooting-star': 'shooting-star 1.2s ease-in forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'shooting-star': {
          '0%': {
            transform: 'translate(0, 0) rotate(-45deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translate(280px, 280px) rotate(-45deg)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
};
