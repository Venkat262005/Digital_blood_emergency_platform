/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF0000",
        "primary-dark": "#CC0000",
        "primary-light": "#FF4D4D",
        "bg-light": "#FFFFFF",
      },
    },
  },
  plugins: [],
};