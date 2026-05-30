/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#c2410c",
        "primary-dark": "#9a3412",
        secondary: "#0c4a6e",
        gold: "#fbbf24",
      }
    },
  },
  plugins: [],
}
