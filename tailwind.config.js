const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const tokens = (name, steps) => Object.fromEntries(steps.map((n) => [n, v(`${name}-${n}`)]));

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Colores con variables CSS (src/index.css) para el modo claro/oscuro y el alto contraste.
      colors: {
        storm: tokens("storm", [50, 400, 600, 800, 900, 950]),
        mist: tokens("mist", [100, 300, 500, 700]),
        brass: { ...tokens("brass", [300, 500, 700]), 400: "#d8b45a" },
        hit: v("hit"),
        partial: v("partial"),
        miss: v("miss"),
        // Texto oscuro fijo sobre fondos claros (botones de latón, celdas amarillas) en ambos temas.
        ink: "#0b1522",
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
