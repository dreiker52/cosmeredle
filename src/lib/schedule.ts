import { mulberry32, seededShuffle } from "./rng";

/**
 * Calendario de personajes del día (data/schedule.json).
 *
 * Es append-only en la práctica: los días ya publicados (hasta mañana incluido, por margen)
 * no cambian nunca. En la parte futura sí se pueden insertar personajes nuevos o quitar los
 * eliminados, porque nadie la ha visto todavía.
 *
 * El calendario se organiza en ciclos: cada ciclo es una permutación de todos los personajes
 * que existían al generarlo. Un ciclo nuevo empieza cuando se repite un id.
 */

/** Semilla base: cambiarla reordena los ciclos que se generen a partir de ahora. */
const BASE_SEED = 0xc053e7e;

/** Días que debe cubrir el calendario por delante del último día bloqueado. */
export const RUNWAY_DAYS = 400;

/** Último índice de día que no se puede modificar (hoy + 1 por margen de despliegue). */
export const lockedUntil = (today: number): number => Math.max(today + 1, -1);

/** Divide el calendario en ciclos: un ciclo termina cuando aparece un id ya visto en él. */
export function splitCycles(entries: readonly string[]): string[][] {
  const cycles: string[][] = [];
  let current: string[] = [];
  let seen = new Set<string>();
  for (const id of entries) {
    if (seen.has(id)) {
      cycles.push(current);
      current = [];
      seen = new Set();
    }
    current.push(id);
    seen.add(id);
  }
  if (current.length) cycles.push(current);
  return cycles;
}

/**
 * Actualiza el calendario a partir de la lista de personajes actual:
 * - entries[0..lockedUntil(today)] no se toca nunca;
 * - en la parte futura se quitan los personajes eliminados y los nuevos se insertan en
 *   posiciones pseudoaleatorias (deterministas) de cada ciclo que aún no ha terminado;
 * - si hace falta, se añaden ciclos nuevos hasta cubrir `runway` días.
 * Es idempotente: si los personajes no cambian, el resultado es el mismo aunque pasen los días.
 */
export function buildSchedule(
  previous: readonly string[],
  characterIds: readonly string[],
  today: number,
  runway: number = RUNWAY_DAYS,
): string[] {
  if (characterIds.length < 2) throw new Error("Hacen falta al menos 2 personajes");
  const ids = [...new Set(characterIds)].sort();
  const valid = new Set(ids);
  const lock = lockedUntil(today);

  const locked = previous.slice(0, lock + 1);
  const tail = previous.slice(lock + 1).filter((id) => valid.has(id));
  const cycles = splitCycles([...locked, ...tail]);

  // Inserta los personajes que faltan en la parte futura de cada ciclo.
  let pos = 0;
  cycles.forEach((cycle, n) => {
    const firstFree = Math.max(lock + 1 - pos, 0); // primer índice del ciclo que se puede tocar
    if (firstFree <= cycle.length && pos + cycle.length > lock) {
      const present = new Set(cycle);
      const missing = ids.filter((id) => !present.has(id));
      if (missing.length) {
        const rand = mulberry32(BASE_SEED + n * 7919 + hashIds(missing));
        for (const id of seededShuffle(missing, BASE_SEED ^ n)) {
          const at = firstFree + Math.floor(rand() * (cycle.length - firstFree + 1));
          cycle.splice(at, 0, id);
        }
      }
    }
    pos += cycle.length;
  });

  const out = cycles.flat();
  let n = cycles.length;
  while (out.length < lock + 1 + runway) {
    const cycle = seededShuffle(ids, BASE_SEED + n * 7919);
    if (cycle[0] === out.at(-1)) [cycle[0], cycle[1]] = [cycle[1], cycle[0]];
    out.push(...cycle);
    n++;
  }

  // Al quitar personajes pueden quedar dos días seguidos iguales en la frontera entre ciclos.
  for (let i = Math.max(lock + 1, 1); i < out.length - 1; i++) {
    if (out[i] === out[i - 1]) [out[i], out[i + 1]] = [out[i + 1], out[i]];
  }
  return out;
}

/** Hash pequeño y estable de una lista de ids, para variar la semilla. */
function hashIds(ids: readonly string[]): number {
  let h = 2166136261;
  for (const ch of ids.join("|")) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Comprueba un calendario. Devuelve errores (vacío si es correcto). */
export function checkSchedule(
  entries: readonly string[],
  characterIds: readonly string[],
  today: number,
  previous?: readonly string[],
): string[] {
  const errors: string[] = [];
  const ids = new Set(characterIds);
  const lock = lockedUntil(today);

  if (previous) {
    const n = Math.min(lock + 1, previous.length);
    for (let i = 0; i < n; i++) {
      if (entries[i] !== previous[i]) {
        errors.push(`el día ${i} ya publicado ha cambiado ("${previous[i]}" -> "${entries[i]}")`);
      }
    }
  }
  if (entries.length < lock + 1 + 30) errors.push(`el calendario se acaba pronto (${entries.length} días)`);

  entries.forEach((id, i) => {
    // Un personaje eliminado puede quedar en días ya publicados, pero no en los futuros.
    if (i > lock && !ids.has(id)) errors.push(`día ${i}: el personaje "${id}" no existe`);
    if (i > 0 && entries[i - 1] === id) errors.push(`día ${i}: "${id}" se repite dos días seguidos`);
  });

  // Todo personaje actual debe salir en algún momento futuro.
  const future = new Set(entries.slice(lock + 1));
  const missing = characterIds.filter((id) => !future.has(id));
  if (missing.length) errors.push(`personajes que no aparecen en el calendario: ${missing.join(", ")}`);
  return errors;
}
