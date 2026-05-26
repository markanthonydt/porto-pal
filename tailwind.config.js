/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        paper: '#f8fafc',
        coral: '#f97316',
        sea: '#0f766e',
        sun: '#facc15',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.18)',
      },
      fontFamily: {
        sans: ['Avenir Next', 'Segoe UI', 'sans-serif'],
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
