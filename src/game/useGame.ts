import { useCallback, useEffect, useState } from "react";
import { characterById, schedule } from "../data/index";
import type { Character } from "../data/schema";
import { characterIdForDay, dayIndex } from "../lib/daily";
import { load, recordWin, save, type Stats } from "../lib/storage";

/**
 * Día que se juega. Antes del lanzamiento se juega el día 0.
 * En desarrollo se puede forzar con ?day=N en la URL.
 */
export function currentDay(now: Date = new Date()): number {
  if (import.meta.env.DEV && typeof location !== "undefined") {
    const forced = new URLSearchParams(location.search).get("day");
    if (forced !== null && /^\d+$/.test(forced)) return Number(forced);
  }
  return Math.max(dayIndex(now), 0);
}

export function targetForDay(day: number): Character | undefined {
  const id = characterIdForDay(schedule, day);
  return id ? characterById.get(id) : undefined;
}

interface DayState {
  day: number;
  guesses: string[];
  solved: boolean;
}

function loadDay(day: number): DayState {
  const g = load().game;
  if (g && g.dayIndex === day) {
    // Ignora ids que ya no existan (p. ej. un personaje eliminado de los datos).
    return { day, guesses: g.guesses.filter((id) => characterById.has(id)), solved: g.solved };
  }
  return { day, guesses: [], solved: false };
}

export interface Game {
  day: number;
  target: Character | undefined;
  /** Intentos en orden cronológico. */
  guesses: Character[];
  solved: boolean;
  stats: Stats;
  /** Id del último intento hecho en esta sesión (para animar solo esa fila). */
  lastGuessId: string | null;
  guess: (id: string) => void;
}

export function useGame(): Game {
  const [state, setState] = useState<DayState>(() => loadDay(currentDay()));
  const [stats, setStats] = useState<Stats>(() => load().stats);
  const [lastGuessId, setLastGuessId] = useState<string | null>(null);
  const target = targetForDay(state.day);

  // Cambio de día a medianoche (Europe/Madrid) sin recargar la página.
  useEffect(() => {
    const timer = setInterval(() => {
      const day = currentDay();
      if (day !== state.day) {
        setState(loadDay(day));
        setLastGuessId(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [state.day]);

  const guess = useCallback(
    (id: string) => {
      if (!target || state.solved || state.guesses.includes(id) || !characterById.has(id)) return;
      const guesses = [...state.guesses, id];
      const solved = id === target.id;
      const data = load();
      const newStats = solved ? recordWin(data.stats, state.day, guesses.length) : data.stats;
      save({ ...data, game: { dayIndex: state.day, guesses, solved }, stats: newStats });
      setState({ day: state.day, guesses, solved });
      setStats(newStats);
      setLastGuessId(id);
    },
    [state, target],
  );

  return {
    day: state.day,
    target,
    guesses: state.guesses.map((id) => characterById.get(id)!),
    solved: state.solved,
    stats,
    lastGuessId,
    guess,
  };
}
