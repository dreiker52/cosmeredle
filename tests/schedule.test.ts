import { describe, expect, it } from "vitest";
import { buildSchedule, checkSchedule, lockedUntil, splitCycles } from "../src/lib/schedule";
import characters from "../data/characters.json";
import schedule from "../data/schedule.json";
import { dayIndex } from "../src/lib/daily";

const ids = (n: number, prefix = "c") => Array.from({ length: n }, (_, i) => `${prefix}${i}`);

describe("splitCycles", () => {
  it("corta cuando se repite un id", () => {
    expect(splitCycles(["a", "b", "c", "b", "a", "c", "a"])).toEqual([["a", "b", "c"], ["b", "a", "c"], ["a"]]);
  });
});

describe("buildSchedule", () => {
  it("cubre el margen pedido y cada ciclo es una permutación completa", () => {
    const chars = ids(20);
    const s = buildSchedule([], chars, -10, 100);
    expect(s.length).toBeGreaterThanOrEqual(lockedUntil(-10) + 1 + 100);
    for (const cycle of splitCycles(s).slice(0, -1)) expect([...cycle].sort()).toEqual([...chars].sort());
    expect(checkSchedule(s, chars, -10)).toEqual([]);
  });

  it("es idempotente aunque pasen los días", () => {
    const chars = ids(20);
    const s = buildSchedule([], chars, 0, 100);
    expect(buildSchedule(s, chars, 0, 100)).toEqual(s);
    expect(buildSchedule(s, chars, 15, 100).slice(0, s.length)).toEqual(s);
  });

  it("nunca cambia los días publicados al añadir o quitar personajes", () => {
    const chars = ids(20);
    const today = 7;
    const s = buildSchedule([], chars, today, 60);
    const added = [...chars.filter((c) => c !== s[3] && c !== s[15]), "nuevo1", "nuevo2"];
    const s2 = buildSchedule(s, added, today, 60);
    const lock = lockedUntil(today);
    expect(s2.slice(0, lock + 1)).toEqual(s.slice(0, lock + 1));
    expect(checkSchedule(s2, added, today, s)).toEqual([]);
    // los nuevos entran en el ciclo en curso, no al final de todo
    const firstCycle = splitCycles(s2)[0];
    expect(firstCycle).toContain("nuevo1");
    expect(firstCycle).toContain("nuevo2");
    // el eliminado del futuro desaparece; el del pasado se queda
    expect(s2.slice(lock + 1)).not.toContain(s[15]);
    expect(s2[3]).toBe(s[3]);
  });
});

describe("checkSchedule", () => {
  it("detecta un día publicado modificado", () => {
    const chars = ids(10);
    const s = buildSchedule([], chars, 3, 40);
    const tampered = [...s];
    [tampered[1], tampered[2]] = [tampered[2], tampered[1]];
    expect(checkSchedule(tampered, chars, 3, s).some((e) => e.includes("ya publicado"))).toBe(true);
  });

  it("el calendario del repositorio es válido y está al día", () => {
    const charIds = characters.map((c) => c.id);
    const today = dayIndex();
    expect(checkSchedule(schedule, charIds, today)).toEqual([]);
    expect(buildSchedule(schedule, charIds, today)).toEqual(schedule);
  });
});
