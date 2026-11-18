import { describe, expect, it } from "vitest";
import { createSearcher, normalize, MAX_RESULTS } from "../src/game/search";
import type { Character } from "../src/data/schema";
import { characters } from "../src/data/index";

const mk = (id: string, name: string, aliases: string[] = [], i18n?: Character["i18n"]): Character => ({
  id,
  name,
  aliases,
  homeworld: "roshar",
  firstAppearance: "stormlight-1",
  species: ["human"],
  investiture: ["none"],
  coppermindUrl: `https://coppermind.net/wiki/${id}`,
  i18n,
});

const sample = [
  mk("kaladin", "Kaladin", ["Kal", "Stormblessed"], { es: { aliases: ["Bendecido por la Tormenta"] } }),
  mk("vin", "Vin", ["Valette Renoux"]),
  mk("sazed", "Sazed"),
  mk("shallan-davar", "Shallan Davar", ["Shallan", "Veil"]),
  mk("elhokar-kholin", "Elhokar Kholin", ["Elhokar"]),
];
const s = createSearcher(sample);
const ids = (q: string, ex?: Set<string>) => s.search(q, ex).map((c) => c.id);

describe("buscador", () => {
  it("normaliza acentos y mayúsculas", () => {
    expect(normalize("  ÉLHÖKAR ")).toBe("elhokar");
  });
  it("exige al menos 2 letras", () => {
    expect(ids("k")).toEqual([]);
    expect(ids("ka")).toContain("kaladin");
  });
  it("busca por alias en cualquier idioma", () => {
    expect(ids("stormbl")[0]).toBe("kaladin");
    expect(ids("bendecido")[0]).toBe("kaladin");
    expect(ids("valette")[0]).toBe("vin");
  });
  it("busca por cualquier palabra del nombre y tolera acentos", () => {
    expect(ids("davar")).toContain("shallan-davar");
    expect(ids("khólin")).toContain("elhokar-kholin");
  });
  it("tolera erratas", () => {
    expect(ids("kaldin")).toContain("kaladin");
    expect(ids("sazde")).toContain("sazed");
  });
  it("oculta los ya intentados", () => {
    expect(ids("kal", new Set(["kaladin"]))).not.toContain("kaladin");
  });
  it(`devuelve como mucho ${MAX_RESULTS} resultados con los datos reales`, () => {
    expect(createSearcher(characters).search("an").length).toBeLessThanOrEqual(MAX_RESULTS);
  });
});
