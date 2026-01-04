/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css}'],
  theme: {
    extend: {
      colors: {
        'app-border': '#e5e7eb', // gray-200
        background: '#ffffff', // white
        foreground: '#111827', // gray-900
      },
    },
  },
  plugins: [],
};