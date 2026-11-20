import { describe, expect, it } from "vitest";
import { characters } from "../src/data/index";
import { SITE_URL, shareGrid, shareText } from "../src/game/share";

const target = characters[0];
const other = characters.find((c) => c.homeworld !== target.homeworld)!;

describe("compartir", () => {
  it("una línea de 5 cuadrados por intento; el acierto es todo verde", () => {
    const grid = shareGrid([other, target], target);
    expect(grid).toHaveLength(2);
    expect([...grid[0]]).toHaveLength(5);
    expect(grid[0].startsWith("🟥🟥")).toBe(true); // nombre y mundo distintos
    expect(grid[1]).toBe("🟩🟩🟩🟩🟩");
  });

  it("el texto lleva cabecera, cuadrícula y enlace, sin nombres", () => {
    const text = shareText("Cosmeredle #3 — 2 intentos", [other, target], target);
    expect(text.split("\n")).toEqual(["Cosmeredle #3 — 2 intentos", ...shareGrid([other, target], target), SITE_URL]);
    expect(text).not.toContain(target.name);
    expect(text).not.toContain(other.name);
  });
});
