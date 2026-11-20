import { bookById, roots } from "../data/index";
import type { Character } from "../data/schema";
import { compareCharacters, type Color } from "./compare";

export const SITE_URL = "https://dreiker52.github.io/cosmeredle/";

const SQUARE: Record<Color, string> = { correct: "🟩", partial: "🟨", wrong: "🟥" };

/** Una línea de cuadrados por intento, en el orden de las columnas. Nunca incluye nombres. */
export function shareGrid(guesses: readonly Character[], target: Character): string[] {
  return guesses.map((g) => {
    const r = compareCharacters(g, target, bookById, roots);
    return [r.name, r.homeworld, r.book.color, r.species, r.investiture].map((c) => SQUARE[c]).join("");
  });
}

/** Texto para compartir; `header` ya viene traducido (p. ej. "Cosmeredle #12 — 4 intentos"). */
export function shareText(header: string, guesses: readonly Character[], target: Character): string {
  return [header, ...shareGrid(guesses, target), SITE_URL].join("\n");
}

export type ShareOutcome = "shared" | "copied" | "failed";

/**
 * En dispositivos táctiles usa el menú nativo de compartir; si no está disponible (o en escritorio),
 * copia al portapapeles.
 */
export async function shareResult(text: string): Promise<ShareOutcome> {
  const touch = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
  if (touch && typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "shared"; // el usuario cerró el menú
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
