import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// "base" debe coincidir con el nombre del repositorio en GitHub Pages:
// https://<usuario>.github.io/cosmeredle/  ->  "/cosmeredle/"
// Cambiar a "/" si se usa dominio propio o el repo <usuario>.github.io.
export default defineConfig({
  plugins: [react()],
  base: "/cosmeredle/",
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
