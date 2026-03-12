/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0d1b2a',
          800: '#1a2e45',
          700: '#1e3a5f',
          600: '#2a4f7e',
        },
        slate: {
          850: '#1e2535',
        }
      },
    },
  },
  plugins: [],
}
