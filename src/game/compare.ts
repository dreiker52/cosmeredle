export type Color = "correct" | "partial" | "wrong";
export type Arrow = "up" | "down" | null;

export interface BookRef {
  id: string;
  order: number;
  series: string;
}

export interface Comparable {
  id: string;
  homeworld: string;
  species: string[];
  investiture: string[];
  firstAppearance: string;
}

export interface GuessResult {
  name: Color;
  homeworld: Color;
  book: { color: Color; arrow: Arrow };
  species: Color;
  investiture: Color;
}

export const compareSingle = (guess: string, target: string): Color =>
  guess === target ? "correct" : "wrong";

/**
 * Verde si los conjuntos son iguales; amarillo si comparten algún valor o, con `rootOf`, algún valor
 * raíz (p. ej. "Nacido de la bruma" y "Lanzamonedas" comparten Alomancia); rojo si no comparten nada.
 */
export function compareMulti(
  guess: readonly string[],
  target: readonly string[],
  rootOf: (id: string) => string = (id) => id,
): Color {
  const g = new Set(guess);
  const t = new Set(target);
  if (g.size === t.size && [...g].every((x) => t.has(x))) return "correct";
  if ([...g].some((x) => t.has(x))) return "partial";
  const roots = new Set([...t].map(rootOf));
  return [...g].some((x) => roots.has(rootOf(x))) ? "partial" : "wrong";
}

/**
 * Verde si es el mismo libro; amarillo si es otro libro de la misma saga; rojo si es otra saga.
 * La flecha indica si el libro del objetivo se publicó después ("up") o antes ("down").
 */
export function compareBook(guess: BookRef, target: BookRef): { color: Color; arrow: Arrow } {
  if (guess.id === target.id) return { color: "correct", arrow: null };
  const color: Color = guess.series === target.series ? "partial" : "wrong";
  return { color, arrow: target.order > guess.order ? "up" : "down" };
}

export interface Roots {
  species?: (id: string) => string;
  investiture?: (id: string) => string;
}

export function compareCharacters(
  guess: Comparable,
  target: Comparable,
  books: ReadonlyMap<string, BookRef>,
  roots: Roots = {},
): GuessResult {
  const gb = books.get(guess.firstAppearance);
  const tb = books.get(target.firstAppearance);
  if (!gb || !tb) {
    throw new Error(`Libro desconocido: ${!gb ? guess.firstAppearance : target.firstAppearance}`);
  }
  return {
    name: compareSingle(guess.id, target.id),
    homeworld: compareSingle(guess.homeworld, target.homeworld),
    book: compareBook(gb, tb),
    species: compareMulti(guess.species, target.species, roots.species),
    investiture: compareMulti(guess.investiture, target.investiture, roots.investiture),
  };
}
