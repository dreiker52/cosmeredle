/**
 * Genera o comprueba data/schedule.json (calendario de personajes del día).
 *
 *   npm run schedule:build   -> regenera la cola futura conservando los días publicados
 *   npm run schedule:check   -> falla si el calendario no está al día o si ha cambiado
 *                               un día ya publicado respecto al commit anterior (CI)
 *   npm run schedule:preview -> lista los próximos 30 personajes para revisarlos
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dayIndex } from "../src/lib/daily";
import { buildSchedule, checkSchedule } from "../src/lib/schedule";

const file = fileURLToPath(new URL("../data/schedule.json", import.meta.url));
const characters: { id: string; name: string }[] = JSON.parse(
  readFileSync(new URL("../data/characters.json", import.meta.url), "utf8"),
);
const ids = characters.map((c) => c.id);
const current: string[] = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
const today = dayIndex();
const mode = process.argv[2] ?? "build";

const serialize = (entries: string[]) => JSON.stringify(entries, null, 0).replace(/","/g, '",\n"') + "\n";

/** Versión del calendario en el commit anterior (si git y el historial están disponibles). */
function previousVersion(): string[] | undefined {
  try {
    const out = execFileSync("git", ["show", "HEAD~1:data/schedule.json"], {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    });
    return JSON.parse(out);
  } catch {
    return undefined;
  }
}

if (mode === "build") {
  const next = buildSchedule(current, ids, today);
  writeFileSync(file, serialize(next));
  console.log(`✓ schedule.json: ${next.length} días (hoy es el día ${today}; bloqueados hasta el ${Math.max(today + 1, -1)})`);
} else if (mode === "check") {
  const prev = previousVersion();
  const errors = checkSchedule(current, ids, today, prev);
  const expected = buildSchedule(current, ids, today);
  if (JSON.stringify(expected) !== JSON.stringify(current)) {
    errors.push("schedule.json no está al día con characters.json: ejecuta `npm run schedule:build`");
  }
  if (errors.length) {
    console.error(`✗ ${errors.length} error(es) en el calendario:\n` + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }
  console.log(`✓ Calendario válido${prev ? " (días publicados sin cambios)" : ""}`);
} else if (mode === "preview") {
  const names = new Map(characters.map((c) => [c.id, c.name]));
  const start = Math.max(today, 0);
  for (let i = start; i < start + 30 && i < current.length; i++) {
    console.log(`#${i}\t${names.get(current[i]) ?? `?? ${current[i]}`}`);
  }
} else {
  console.error(`Modo desconocido: ${mode}`);
  process.exit(1);
}
