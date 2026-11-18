import { useEffect, useState } from "react";
import { msUntilNextDay } from "../lib/daily";

const pad = (n: number) => String(n).padStart(2, "0");

export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** Cuenta atrás hasta el siguiente personaje (medianoche en Europe/Madrid). */
export function Countdown() {
  const [ms, setMs] = useState(() => msUntilNextDay());
  useEffect(() => {
    const timer = setInterval(() => setMs(msUntilNextDay()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span role="timer" className="font-mono text-2xl tabular-nums text-brass-300">
      {formatCountdown(ms)}
    </span>
  );
}
