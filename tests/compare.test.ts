import { describe, expect, it } from "vitest";
import { compareBook, compareCharacters, compareMulti, compareSingle } from "../src/game/compare";
import books from "../data/books.json";
import characters from "../data/characters.json";

const bookMap = new Map(books.map((b) => [b.id, b]));
const byId = (id: string) => characters.find((c) => c.id === id)!;

describe("compareSingle", () => {
  it("verde si es igual, rojo si no", () => {
    expect(compareSingle("roshar", "roshar")).toBe("correct");
    expect(compareSingle("roshar", "scadrial")).toBe("wrong");
  });
});

describe("compareMulti", () => {
  it("verde con conjuntos iguales sin importar el orden", () => {
    expect(compareMulti(["allomancy", "feruchemy"], ["feruchemy", "allomancy"])).toBe("correct");
  });
  it("amarillo si comparten alguno", () => {
    expect(compareMulti(["allomancy", "feruchemy"], ["allomancy"])).toBe("partial");
    expect(compareMulti(["allomancy"], ["allomancy", "hemalurgy"])).toBe("partial");
  });
  it("rojo si no comparten ninguno", () => {
    expect(compareMulti(["surgebinding"], ["allomancy"])).toBe("wrong");
  });
  it("unknown y none se tratan como valores normales", () => {
    expect(compareMulti(["unknown"], ["unknown"])).toBe("correct");
    expect(compareMulti(["none"], ["unknown"])).toBe("wrong");
  });
});

describe("compareBook", () => {
  const b = (id: string) => bookMap.get(id)!;
  it("verde si es el mismo libro", () => {
    expect(compareBook(b("mistborn-1"), b("mistborn-1"))).toEqual({ color: "correct", arrow: null });
  });
  it("amarillo y flecha si es la misma saga", () => {
    expect(compareBook(b("mistborn-4"), b("mistborn-1"))).toEqual({ color: "partial", arrow: "down" });
    expect(compareBook(b("mistborn-1"), b("mistborn-3"))).toEqual({ color: "partial", arrow: "up" });
  });
  it("rojo y flecha si es otra saga", () => {
    expect(compareBook(b("stormlight-1"), b("mistborn-1"))).toEqual({ color: "wrong", arrow: "down" });
    expect(compareBook(b("elantris"), b("mistborn-1"))).toEqual({ color: "wrong", arrow: "up" });
  });
});

describe("compareCharacters (ejemplos del PLAN, objetivo Vin)", () => {
  const vin = byId("vin");
  it("Kaladin", () => {
    expect(compareCharacters(byId("kaladin"), vin, bookMap)).toEqual({
      name: "wrong",
      homeworld: "wrong",
      book: { color: "wrong", arrow: "down" },
      species: "correct",
      investiture: "wrong",
    });
  });
  it("Wax", () => {
    expect(compareCharacters(byId("wax"), vin, bookMap)).toEqual({
      name: "wrong",
      homeworld: "correct",
      book: { color: "partial", arrow: "down" },
      species: "correct",
      investiture: "partial",
    });
  });
  it("Vin", () => {
    const r = compareCharacters(vin, vin, bookMap);
    expect(Object.values(r).every((v) => v === "correct" || (typeof v === "object" && v.color === "correct"))).toBe(
      true,
    );
  });
  it("lanza si el libro no existe", () => {
    expect(() => compareCharacters({ ...vin, firstAppearance: "nope" }, vin, bookMap)).toThrow();
  });
});
