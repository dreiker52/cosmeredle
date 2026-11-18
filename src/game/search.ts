import Fuse from "fuse.js";
import type { Character } from "../data/schema";
import { searchableNames } from "../data/index";

export const MIN_QUERY = 2;
export const MAX_RESULTS = 8;

/** Quita acentos y pasa a minúsculas para comparar sin que importen. */
export const normalize = (s: string): string =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

interface Entry {
  character: Character;
  names: string[]; // normalizados
}

export interface Searcher {
  search(query: string, exclude?: ReadonlySet<string>): Character[];
}

/**
 * Buscador difuso sobre nombre y alias (en ambos idiomas). Las coincidencias por prefijo
 * de alguna palabra van siempre primero; el resto, por la puntuación de Fuse.js.
 */
export function createSearcher(characters: readonly Character[]): Searcher {
  const entries: Entry[] = characters.map((character) => ({
    character,
    names: searchableNames(character).map(normalize),
  }));
  const fuse = new Fuse(entries, { keys: ["names"], threshold: 0.3, ignoreLocation: true });

  return {
    search(query, exclude = new Set()) {
      const q = normalize(query);
      if (q.length < MIN_QUERY) return [];
      const ok = (e: Entry) => !exclude.has(e.character.id);

      const prefix = entries.filter(
        (e) => ok(e) && e.names.some((n) => n.startsWith(q) || n.split(/[\s-]+/).some((w) => w.startsWith(q))),
      );
      // Primero quienes empiezan por la búsqueda en su nombre principal.
      prefix.sort((a, b) => Number(!a.names[0].startsWith(q)) - Number(!b.names[0].startsWith(q)) || a.names[0].localeCompare(b.names[0]));

      const seen = new Set(prefix.map((e) => e.character.id));
      const fuzzy = fuse
        .search(q)
        .map((r) => r.item)
        .filter((e) => ok(e) && !seen.has(e.character.id));

      return [...prefix, ...fuzzy].slice(0, MAX_RESULTS).map((e) => e.character);
    },
  };
}
