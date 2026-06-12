/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          dark: '#0B132B',
          primary: '#1C2541',
          accent: '#3A506B',
          blue: '#5BC0BE',
          gold: '#FFD700',
        }
      }
    },
  },
  plugins: [],
}
