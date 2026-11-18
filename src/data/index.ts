import charactersJson from "../../data/characters.json";
import booksJson from "../../data/books.json";
import taxonomyJson from "../../data/taxonomy.json";
import scheduleJson from "../../data/schedule.json";
import type { Book, Character, Taxonomy } from "./schema";
import type { Lang } from "../i18n/I18nProvider";

// Los datos ya se validan en el CI (npm run validate-data), así que aquí solo se tipan.
export const characters = charactersJson as Character[];
export const books = booksJson as Book[];
export const taxonomy = taxonomyJson as Taxonomy;
export const schedule = scheduleJson as string[];

export const characterById = new Map(characters.map((c) => [c.id, c]));
export const bookById = new Map(books.map((b) => [b.id, b]));

export type TaxonomyCategory = keyof Taxonomy;

/** Traduce un id de la taxonomía; si no existe devuelve el propio id. */
export const label = (category: TaxonomyCategory, id: string, lang: Lang): string =>
  taxonomy[category][id]?.[lang] ?? id;

/** Nombre visible del personaje en el idioma activo. */
export const displayName = (c: Character, lang: Lang): string => c.i18n?.[lang]?.name ?? c.name;

/** Alias visibles: los del idioma activo primero, sin repetir el nombre visible. */
export function displayAliases(c: Character, lang: Lang): string[] {
  const name = displayName(c, lang);
  const all = [...(c.i18n?.[lang]?.aliases ?? []), ...c.aliases];
  if (c.i18n?.[lang]?.name) all.push(c.name);
  return [...new Set(all)].filter((a) => a !== name);
}

/** Todos los nombres por los que se puede buscar a un personaje, en cualquier idioma. */
export function searchableNames(c: Character): string[] {
  return [
    ...new Set(
      [c.name, ...c.aliases, c.i18n?.es?.name, ...(c.i18n?.es?.aliases ?? []), c.i18n?.en?.name, ...(c.i18n?.en?.aliases ?? [])].filter(
        (n): n is string => !!n,
      ),
    ),
  ];
}
