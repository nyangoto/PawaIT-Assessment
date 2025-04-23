// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enables manual dark mode toggling
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Onest', 'sans-serif'],
      },
      colors: {
        background: {
          DEFAULT: '#ffffff',
          dark: '#18181b',
        },
        surface: {
          DEFAULT: '#f8f9fa',
          dark: '#36353f',
        },
        primary: '#5645ee',
        text: {
          DEFAULT: '#18181b',
          dark: '#ffffff',
        },
      },
    },
  },
  plugins: [],
};
