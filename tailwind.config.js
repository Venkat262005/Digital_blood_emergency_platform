/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#DC2626",        // matches your --color-primary-600
        "primary-dark": "#B91C1C", // matches --color-primary-700
        "primary-light": "#FCA5A5",
        "neutral-light": "#F8FAFC",
      },
      fontFamily: {
        primary: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        red: "0 10px 30px -5px rgba(220, 38, 38, 0.3)",
        "red-lg": "0 20px 40px -10px rgba(220, 38, 38, 0.4)",
      },
    },
  },
  plugins: [],
};
