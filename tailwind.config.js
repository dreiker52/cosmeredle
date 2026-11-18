/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        storm: { 50: "#eef4fb", 400: "#5b8fc7", 600: "#2f5f94", 800: "#1b3554", 900: "#122338", 950: "#0b1522" },
        mist: { 100: "#e7e9ec", 300: "#b9bec6", 500: "#7c838f", 700: "#454b55" },
        brass: { 300: "#e6c77d", 500: "#c49a3a", 700: "#8a6a22" },
        hit: "#2f8f4e",
        partial: "#c9a227",
        miss: "#a63d3d",
      },
      keyframes: {
        flip: {
          "0%": { transform: "rotateX(90deg)", opacity: "0" },
          "100%": { transform: "rotateX(0deg)", opacity: "1" },
        },
      },
      animation: {
        flip: "flip 0.5s ease-out both",
      },
      minHeight: { 16: "4rem" },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
