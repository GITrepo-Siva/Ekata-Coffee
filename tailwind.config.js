/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-brown': '#6F4E37',
        'brand-cream': '#F5F5DC',
        'brand-green': '#4CAF50',
        'brand-dark': '#2C1E12',
        'brand-light-gray': '#F0EBE3',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
