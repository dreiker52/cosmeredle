/**
 * Valida los datos del juego. Uso: npm run validate-data
 * Falla (exit 1) si hay errores de esquema o referencias rotas.
 */
import { readFileSync } from "node:fs";
import { validateData } from "../src/data/validate";

const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8"));

const errors = validateData({
  taxonomy: read("taxonomy.json"),
  books: read("books.json"),
  characters: read("characters.json"),
});

if (errors.length) {
  console.error(`✗ ${errors.length} error(es) en los datos:\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("✓ Datos válidos");
