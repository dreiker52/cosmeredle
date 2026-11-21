import { describe, expect, it } from "vitest";
import { LAUNCH_DATE, characterIdForDay, dayIndex, gameDate, msUntilNextDay } from "../src/lib/daily";
import { mulberry32, seededShuffle } from "../src/lib/rng";

describe("rng", () => {
  it("misma semilla, misma secuencia", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("seededShuffle es determinista, no muta y conserva los elementos", () => {
    const input = Array.from({ length: 50 }, (_, i) => i);
    const s1 = seededShuffle(input, 7);
    expect(seededShuffle(input, 7)).toEqual(s1);
    expect(input).toEqual(Array.from({ length: 50 }, (_, i) => i));
    expect([...s1].sort((x, y) => x - y)).toEqual(input);
    expect(seededShuffle(input, 8)).not.toEqual(s1);
  });
});

describe("daily", () => {
  it("el día de lanzamiento es el 0", () => {
    // Mediodía UTC del día de lanzamiento (y del siguiente): es ese mismo día en Madrid todo el año.
    const next = new Date(Date.parse(`${LAUNCH_DATE}T12:00:00Z`) + 86_400_000);
    expect(dayIndex(new Date(`${LAUNCH_DATE}T12:00:00Z`))).toBe(0);
    expect(dayIndex(next)).toBe(1);
  });

  it("cambia a medianoche de Madrid, no a medianoche UTC (invierno)", () => {
    // 23:30 UTC del 1 de enero = 00:30 del 2 de enero en Madrid
    expect(gameDate(new Date("2027-01-01T23:30:00Z"))).toBe("2027-01-02");
    const before = dayIndex(new Date("2027-01-01T22:59:00Z"));
    expect(dayIndex(new Date("2027-01-01T12:00:00Z"))).toBe(before);
    expect(dayIndex(new Date("2027-01-01T23:00:00Z"))).toBe(before + 1);
  });

  it("respeta el horario de verano (UTC+2)", () => {
    expect(gameDate(new Date("2027-07-01T21:59:00Z"))).toBe("2027-07-01");
    expect(gameDate(new Date("2027-07-01T22:00:00Z"))).toBe("2027-07-02");
  });

  it("cuenta los días correctamente a través del cambio de hora", () => {
    // 28 de marzo de 2027: cambio a horario de verano en Europa
    const before = dayIndex(new Date("2027-03-27T12:00:00Z"));
    const after = dayIndex(new Date("2027-03-29T12:00:00Z"));
    expect(after - before).toBe(2);
  });

  it("msUntilNextDay apunta a la siguiente medianoche de Madrid", () => {
    const now = new Date("2027-01-01T22:00:00Z"); // 23:00 en Madrid
    expect(msUntilNextDay(now)).toBeLessThanOrEqual(3_600_000);
    expect(msUntilNextDay(now)).toBeGreaterThan(3_600_000 - 2000);
  });

  it("characterIdForDay recorre el calendario y vuelve a empezar", () => {
    const schedule = ["a", "b", "c"];
    expect(characterIdForDay(schedule, 0)).toBe("a");
    expect(characterIdForDay(schedule, 4)).toBe("b");
    expect(characterIdForDay(schedule, -1)).toBeUndefined();
    expect(characterIdForDay([], 0)).toBeUndefined();
  });
});
