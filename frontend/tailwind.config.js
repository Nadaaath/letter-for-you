/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        script: ["Dancing Script", "cursive"],
      },
      colors: {
        cream: "#FFF7ED",
        roseSoft: "#FCE7F3",
        roseDust: "#E8A2A8",
        burgundy: "#7F1D1D",
        cocoa: "#8B5E3C",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(127, 29, 29, 0.12)",
      },
    },
  },
  plugins: [],
};