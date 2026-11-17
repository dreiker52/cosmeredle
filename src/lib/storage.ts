import type { Lang } from "../i18n/I18nProvider";

const KEY = "cosmeredle";
const VERSION = 1;

export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  totalGuesses: number;
  lastWonDay: number | null;
}

export interface SaveData {
  version: number;
  settings: { lang?: Lang };
  game: { dayIndex: number; guesses: string[]; solved: boolean } | null;
  stats: Stats;
}

export const emptyStats = (): Stats => ({
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalGuesses: 0,
  lastWonDay: null,
});

const empty = (): SaveData => ({ version: VERSION, settings: {}, game: null, stats: emptyStats() });

/** Lee el estado guardado. Nunca lanza: si localStorage no está disponible devuelve un estado vacío. */
export function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw) as Partial<SaveData>;
    if (data.version !== VERSION) return migrate(data);
    return { ...empty(), ...data } as SaveData;
  } catch {
    return empty();
  }
}

export function save(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Almacenamiento bloqueado o lleno: el juego sigue funcionando sin persistencia.
  }
}

/** Punto de entrada para futuras migraciones de formato. */
function migrate(_old: Partial<SaveData>): SaveData {
  return empty();
}

/** Actualiza las estadísticas al resolver el día `day` con `guesses` intentos. */
export function recordWin(stats: Stats, day: number, guesses: number): Stats {
  const streak = stats.lastWonDay === day - 1 ? stats.currentStreak + 1 : 1;
  return {
    played: stats.played + 1,
    won: stats.won + 1,
    currentStreak: streak,
    maxStreak: Math.max(stats.maxStreak, streak),
    totalGuesses: stats.totalGuesses + guesses,
    lastWonDay: day,
  };
}
