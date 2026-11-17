import { z } from "zod";
import { Book, Character, Taxonomy } from "./schema";

/** Valida taxonomía, libros y personajes. Devuelve la lista de errores (vacía si todo es correcto). */
export function validateData(raw: { taxonomy: unknown; books: unknown; characters: unknown }): string[] {
  const errors: string[] = [];
  const tax = Taxonomy.safeParse(raw.taxonomy);
  const books = z.array(Book).safeParse(raw.books);
  const chars = z.array(Character).safeParse(raw.characters);

  for (const [name, r] of [["taxonomy", tax], ["books", books], ["characters", chars]] as const) {
    if (!r.success) r.error.issues.forEach((i) => errors.push(`${name}: ${i.path.join(".")} ${i.message}`));
  }
  if (!tax.success || !books.success || !chars.success) return errors;

  const t = tax.data;
  const bookIds = new Set<string>();
  const orders = new Set<number>();
  for (const b of books.data) {
    if (bookIds.has(b.id)) errors.push(`books: id duplicado "${b.id}"`);
    if (orders.has(b.order)) errors.push(`books: order duplicado ${b.order} ("${b.id}")`);
    if (!t.series[b.series]) errors.push(`books: "${b.id}" usa una saga desconocida "${b.series}"`);
    bookIds.add(b.id);
    orders.add(b.order);
  }

  const ids = new Set<string>();
  const names = new Map<string, string>(); // nombre/alias normalizado -> id
  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

  for (const c of chars.data) {
    if (ids.has(c.id)) errors.push(`characters: id duplicado "${c.id}"`);
    ids.add(c.id);
    if (!t.worlds[c.homeworld]) errors.push(`${c.id}: mundo desconocido "${c.homeworld}"`);
    if (!bookIds.has(c.firstAppearance)) errors.push(`${c.id}: libro desconocido "${c.firstAppearance}"`);
    c.species.filter((s) => !t.species[s]).forEach((s) => errors.push(`${c.id}: especie desconocida "${s}"`));
    c.investiture
      .filter((s) => !t.investiture[s])
      .forEach((s) => errors.push(`${c.id}: investidura desconocida "${s}"`));
    if (c.investiture.length > 1 && c.investiture.some((s) => s === "none" || s === "unknown")) {
      errors.push(`${c.id}: "none"/"unknown" no se pueden combinar con otros poderes`);
    }

    const allNames = [
      c.name,
      ...c.aliases,
      c.i18n?.es?.name,
      ...(c.i18n?.es?.aliases ?? []),
      c.i18n?.en?.name,
      ...(c.i18n?.en?.aliases ?? []),
    ].filter((n): n is string => !!n);
    for (const n of new Set(allNames.map(norm))) {
      const owner = names.get(n);
      if (owner && owner !== c.id) errors.push(`${c.id}: el nombre/alias "${n}" ya lo usa "${owner}"`);
      names.set(n, c.id);
    }
  }
  return errors;
}
