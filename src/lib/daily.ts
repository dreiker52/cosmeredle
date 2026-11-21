/** Fecha de lanzamiento: el día 0 del calendario. Ajustar antes de publicar. */
export const LAUNCH_DATE = "2026-11-21";

/** Zona horaria en la que cambia el personaje del día, igual para todos los jugadores. */
export const GAME_TZ = "Europe/Madrid";

const DAY_MS = 86_400_000;

/** Fecha "del juego" (YYYY-MM-DD) en la zona horaria configurada. */
export function gameDate(now: Date = new Date(), tz: string = GAME_TZ): string {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function ymdToUtc(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Número de día desde el lanzamiento (0 = día de lanzamiento; negativo = antes). */
export function dayIndex(now: Date = new Date(), tz: string = GAME_TZ): number {
  return Math.round((ymdToUtc(gameDate(now, tz)) - ymdToUtc(LAUNCH_DATE)) / DAY_MS);
}

/** Milisegundos hasta el próximo cambio de personaje (medianoche en GAME_TZ). */
export function msUntilNextDay(now: Date = new Date(), tz: string = GAME_TZ): number {
  const today = dayIndex(now, tz);
  // Búsqueda por pasos de 1 minuto sería cara; avanzamos por horas y luego afinamos.
  let probe = now.getTime();
  const step = 3_600_000;
  while (dayIndex(new Date(probe + step), tz) === today) probe += step;
  let lo = probe;
  let hi = probe + step;
  while (hi - lo > 1000) {
    const mid = Math.floor((lo + hi) / 2);
    if (dayIndex(new Date(mid), tz) === today) lo = mid;
    else hi = mid;
  }
  return hi - now.getTime();
}

/**
 * Devuelve el id del personaje para un día dado a partir del calendario.
 * El calendario (schedule.json) es append-only y lo genera scripts/build-schedule.ts.
 */
export function characterIdForDay(schedule: readonly string[], idx: number): string | undefined {
  if (idx < 0 || schedule.length === 0) return undefined;
  return schedule[idx % schedule.length];
}
