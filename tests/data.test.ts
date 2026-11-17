import { describe, expect, it } from "vitest";
import { validateData } from "../src/data/validate";
import taxonomy from "../data/taxonomy.json";
import books from "../data/books.json";
import characters from "../data/characters.json";
import es from "../src/i18n/es.json";
import en from "../src/i18n/en.json";
import { recordWin, emptyStats } from "../src/lib/storage";
import { detectLang } from "../src/i18n/I18nProvider";

describe("datos", () => {
  it("los datos del repositorio son válidos", () => {
    expect(validateData({ taxonomy, books, characters })).toEqual([]);
  });

  it("detecta referencias rotas y alias duplicados", () => {
    const bad = [
      ...characters,
      { ...characters[0], id: "copia", homeworld: "marte", firstAppearance: "libro-x", species: ["elfo"] },
    ];
    const errors = validateData({ taxonomy, books, characters: bad });
    expect(errors.some((e) => e.includes('mundo desconocido "marte"'))).toBe(true);
    expect(errors.some((e) => e.includes('libro desconocido "libro-x"'))).toBe(true);
    expect(errors.some((e) => e.includes('especie desconocida "elfo"'))).toBe(true);
    expect(errors.some((e) => e.includes(`ya lo usa "${characters[0].id}"`))).toBe(true);
  });
});

describe("i18n", () => {
  it("es.json y en.json tienen las mismas claves", () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
  });
  it("detectLang: preferencia guardada > idioma del navegador > inglés", () => {
    expect(detectLang("en", "es-ES")).toBe("en");
    expect(detectLang(undefined, "es-MX")).toBe("es");
    expect(detectLang(undefined, "fr-FR")).toBe("en");
    expect(detectLang(undefined, undefined)).toBe("en");
  });
});

describe("estadísticas", () => {
  it("la racha sigue en días consecutivos y se reinicia si se salta uno", () => {
    let s = recordWin(emptyStats(), 10, 4);
    s = recordWin(s, 11, 2);
    expect(s).toMatchObject({ played: 2, won: 2, currentStreak: 2, maxStreak: 2, totalGuesses: 6 });
    s = recordWin(s, 13, 5);
    expect(s).toMatchObject({ currentStreak: 1, maxStreak: 2 });
  });
});
