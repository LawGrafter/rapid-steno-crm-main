/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'lexend': ['Lexend', 'sans-serif'],
      },
      colors: {
        'primary': '#002E2C',
        'primary-light': '#004A45',
        'primary-hover': '#001A19',
        'accent': '#f97316',
        'accent-hover': '#ea580c',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
      },
    },
  },
  plugins: [],
};