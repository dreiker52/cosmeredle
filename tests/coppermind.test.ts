import { parseAbilities } from "../scripts/coppermind/abilities";
import { describe, expect, it } from "vitest";
import {
  bookRefCodes,
  findTemplate,
  slugify,
  spanishTitle,
  splitList,
  stripDisambiguation,
  tags,
  templateFields,
} from "../scripts/coppermind/wikitext";
import { bookCodes, resolveTitle, type Page } from "../scripts/coppermind/dump";
import { applyOverrides, extractCharacters, firstNameAlias } from "../scripts/coppermind/build";
import { inboundLinks, isRelevant, relevanceOf } from "../scripts/coppermind/relevance";
import type { Book } from "../src/data/schema";

const page = (title: string, text: string, ns = 0): [string, Page] => [title, { title, ns, text }];

describe("wikitext", () => {
  const tpl = `Texto previo {{character
|abilities={{tag+|Mistborn}}, {{tag+|Hemalurgist}}{{book ref|mb3|81}}
|aliases=Valette Renoux, [[Lady Mistborn|The Lady]]<ref>x</ref>
|world=Scadrial
|'species=kandra
|introduced=[[Mistborn: The Final Empire]]
}} resto`;

  it("encuentra la plantilla completa con llaves anidadas", () => {
    expect(findTemplate(tpl, "character")?.endsWith("}}")).toBe(true);
    expect(findTemplate(tpl, "book")).toBeNull();
  });

  it("separa los campos respetando plantillas anidadas y corrige claves con erratas", () => {
    const f = templateFields(findTemplate(tpl, "character")!);
    expect(f.world).toBe("Scadrial");
    expect(f.species).toBe("kandra");
    expect(f.introduced).toBe("[[Mistborn: The Final Empire]]");
    expect(tags(f.abilities)).toEqual(["mistborn", "hemalurgist"]);
    expect(splitList(f.aliases)).toEqual(["Valette Renoux", "The Lady"]);
  });

  it("utilidades varias", () => {
    expect(bookRefCodes("a {{book ref|mb1|3}} b {{book ref|SA2|1}}")).toEqual(["mb1", "sa2"]);
    expect(spanishTitle("x [[es:El Imperio Final (libro)]]")).toBe("El Imperio Final (libro)");
    expect(stripDisambiguation("Cob (Mistborn)")).toBe("Cob");
    expect(slugify("Wan ShaiLu's Ñandú")).toBe("wan-shailus-nandu");
    expect(firstNameAlias("Shallan Davar")).toEqual(["Shallan"]);
    expect(firstNameAlias("Lord Ruler")).toEqual([]);
    expect(firstNameAlias("Vin")).toEqual([]);
  });
});

describe("extracción de personajes (volcado sintético)", () => {
  const books: Book[] = [
    { id: "mistborn-1", order: 1, year: 2006, series: "mistborn", title: { es: "El Imperio Final", en: "The Final Empire" }, coppermindPage: "Mistborn: The Final Empire" },
    { id: "mistborn-2", order: 2, year: 2007, series: "mistborn", title: { es: "El Pozo", en: "The Well of Ascension" }, coppermindPage: "The Well of Ascension" },
  ];
  const pages = new Map<string, Page>([
    page("Template:B", "-->|mb1|tfe=The Final Empire<!--\n-->|mb2=The Well of Ascension<!--", 10),
    page("The Final Empire", "#REDIRECT [[Mistborn: The Final Empire]]"),
    page("Mistborn: The Final Empire", "{{book|released=2006}}"),
    page("The Well of Ascension", "{{book|released=2007}}"),
    page("Vin", "{{character\n|abilities={{tag+|Mistborn}}, {{tag+|shard|Preservation}}\n|aliases=Valette Renoux\n|world=Scadrial\n|universe=[[Cosmere]]\n|introduced=[[Mistborn: The Final Empire]]\n}}\n[[es:Vin]]"),
    page("Spook", "{{character\n|world=Scadrial\n|universe=[[Cosmere]]\n}}\nTexto {{book ref|mb2|3}} y {{book ref|tfe|5}}.\n[[es:Fantasma]]"),
    page("Cob (Mistborn)", "{{character\n|world=Scadrial\n|universe=[[Cosmere]]\n|introduced=[[The Well of Ascension]]\n}}"),
    page("Cob (Stormlight)", "{{character\n|world=Roshar\n|universe=[[Cosmere]]\n|introduced=[[The Well of Ascension]]\n}}"),
    page("Rig", "{{character\n|world=Detritus\n|universe=[[Cytoverse]]\n}}"),
    page("Vin's mother", "{{character\n|unnamed=yes\n|world=Scadrial\n|universe=[[Cosmere]]\n}}"),
    page("TenSoon", "{{character\n|species=kandra\n|abilities=[[Blessing of Presence]], [[Blessing of Potency]]\n|world=Scadrial\n|universe=[[Cosmere]]\n|introduced=[[The Well of Ascension]]\n}}"),
    page("Shalash", "{{character\n|abilities={{tag+|Cognitive Shadow}}, {{tag+|Shardbearer}}\n|world=Roshar\n|universe=[[Cosmere]]\n|introduced=[[The Well of Ascension]]\n}}"),
    page("Syl", "{{character\n|species=Honorspren\n|abilities=[[Nahel bond]], [[Windrunner]] magic, {{tag+|Splinter}} of [[Honor]]\n|world=Roshar\n|universe=[[Cosmere]]\n|introduced=[[The Well of Ascension]]\n}}"),
    page("Yelig-nar", "{{character\n|species=spren\n|abilities={{tag+|Splinter}} of [[Odium]]\n|world=Roshar\n|universe=[[Cosmere]]\n|introduced=[[The Well of Ascension]]\n}}"),
    page("Leras", "{{character\n|abilities={{tag+|Shard|Preservation}}\n|world=Scadrial\n|universe=[[Cosmere]]\n|introduced=[[The Well of Ascension]]\n}}"),
  ]);

  it("resuelve redirecciones y códigos de libro", () => {
    expect(resolveTitle(pages, "the Final Empire")).toBe("Mistborn: The Final Empire");
    expect(bookCodes(pages).get("tfe")).toBe("Mistborn: The Final Empire");
  });

  const { characters, report } = extractCharacters(pages, books, { filterRelevance: false });
  const byId = new Map(characters.map((c) => [c.id, c]));

  it("extrae y normaliza los campos", () => {
    expect(byId.get("vin")).toMatchObject({
      name: "Vin",
      homeworld: "scadrial",
      firstAppearance: "mistborn-1",
      species: ["human"],
      investiture: ["mistborn", "vessel-preservation"],
      aliases: ["Valette Renoux"],
      coppermindUrl: "https://coppermind.net/wiki/Vin",
    });
    expect(byId.get("vin")?.i18n).toBeUndefined(); // mismo nombre en español
    expect(byId.get("tensoon")).toMatchObject({
      species: ["kandra"],
      investiture: ["blessing-of-presence", "blessing-of-potency", "shapeshifter"],
    });
  });

  it("deduce la Investidura de enlaces, especies y casos especiales", () => {
    expect(byId.get("shalash")).toMatchObject({ species: ["human"], investiture: ["cognitive-shadow", "shardbearer"] });
    expect(byId.get("syl")).toMatchObject({ species: ["honorspren"], investiture: ["nahel-bond", "windrunner", "splinter-honor"] });
    expect(byId.get("yelig-nar")).toMatchObject({ species: ["unmade"], investiture: ["splinter-odium"] });
    expect(byId.get("leras")?.investiture).toEqual(["vessel-preservation"]);
  });

  it("deduce la primera aparición del libro más antiguo citado", () => {
    expect(byId.get("spook")?.firstAppearance).toBe("mistborn-1");
    expect(byId.get("spook")?.i18n?.es?.name).toBe("Fantasma");
    expect(report.inferredBook).toEqual([{ id: "spook", book: "mistborn-1" }]);
  });

  it("desambigua nombres repetidos, descarta no-Cosmere y sin nombre", () => {
    expect(byId.get("cob-mistborn")?.name).toBe("Cob (Mistborn)");
    expect(byId.get("cob-stormlight")?.name).toBe("Cob (Stormlight)");
    expect(byId.has("rig")).toBe(false);
    expect(report.nonCosmere).toBe(1);
    expect(report.excluded.map((e) => e.title)).toContain("Vin's mother");
  });

  it("aplica overrides y exclusiones", () => {
    const out = applyOverrides(characters, { vin: { investiture: ["allomancy", "hemalurgy"] }, tensoon: { exclude: true } });
    expect(out.find((c) => c.id === "vin")?.investiture).toEqual(["allomancy", "hemalurgy"]);
    expect(out.find((c) => c.id === "vin")?.name).toBe("Vin");
    expect(out.some((c) => c.id === "tensoon")).toBe(false);
  });

  it("ignora overrides de personajes que no existen", () => {
    const orphans: string[] = [];
    const out = applyOverrides(characters, { fantasma: { name: "X" } }, orphans);
    expect(out).toHaveLength(characters.length);
    expect(orphans).toEqual(["fantasma"]);
  });

  it("filtra por relevancia salvo los incluidos a mano", () => {
    const filtered = extractCharacters(pages, books, { include: new Set(["vin"]) });
    expect(filtered.characters.map((c) => c.id)).toEqual(["vin"]);
    expect(filtered.report.forcedIncludes).toEqual(["vin"]);
    expect(filtered.report.irrelevant.length).toBeGreaterThan(0);
  });
});

describe("relevancia", () => {
  it("regla de umbrales", () => {
    expect(isRelevant({ inbound: 20, chapters: 0, length: 0 })).toBe(true);
    expect(isRelevant({ inbound: 10, chapters: 10, length: 0 })).toBe(true);
    expect(isRelevant({ inbound: 10, chapters: 0, length: 10_000 })).toBe(true);
    expect(isRelevant({ inbound: 9, chapters: 50, length: 50_000 })).toBe(false);
    expect(isRelevant({ inbound: 15, chapters: 3, length: 2000 })).toBe(false);
  });

  it("cuenta enlaces entrantes (con redirecciones, sin duplicados ni autoenlaces) y capítulos distintos", () => {
    const pages = new Map<string, Page>([
      page("Vin", "Soy [[Vin]]. {{book ref|mb1|1}} {{book ref|mb1|1}} {{book ref|mb1|2}}"),
      page("Valette", "#REDIRECT [[Vin]]"),
      page("Kelsier", "Conoce a [[Vin]] y a [[Valette|la noble]]. [[Category:Vin]]"),
      page("Elend", "Ama a [[vin]]."),
    ]);
    const inbound = inboundLinks(pages, new Set(["Vin"]));
    expect(inbound.get("Vin")).toBe(2);
    expect(relevanceOf(pages.get("Vin")!, inbound)).toMatchObject({ inbound: 2, chapters: 2 });
  });
});

describe("parseAbilities", () => {
  it("lee etiquetas y parámetros de Esquirla; lo que tuvo (formerly) cuenta como actual (Kelsier)", () => {
    const r = parseAbilities(
      "{{tag+|Mistborn}} <small>(formerly)</small>{{nosnippet|, {{tag+|Sliver}}, {{tag+|Cognitive Shadow}}, {{tag+|shard|Preservation}} <small>(formerly)</small>}}, {{tag+|Hemalurgist}}",
    );
    expect(r.ids).toEqual(["mistborn", "sliver", "cognitive-shadow", "vessel-preservation", "hemalurgist"]);
    expect(r.unknown).toEqual([]);
  });
  it("lee enlaces y astillas con su Esquirla, sin contar la Esquirla como poder", () => {
    expect(parseAbilities("[[Nahel bond]], [[Order of Lightweavers|Lightweaver]] magic, {{tag+|Splinter}} of [[Odium]]").ids).toEqual([
      "nahel-bond",
      "lightweaver",
      "splinter-odium",
    ]);
    expect(parseAbilities("[[Splinter]] of Honor and Cultivation").ids).toEqual(["splinter-honor", "splinter-cultivation"]);
  });
  it("conserva las etiquetas de un <small> con (formerly) y quita los calificativos", () => {
    const r = parseAbilities("{{tag+|Tineye}} <small>({{tag+|Savant}}, formerly)</small>, {{tag+|Fused}} <small>([[Shanay-im]])</small>");
    expect(r.ids).toEqual(["tineye", "savant", "fused"]);
  });
  it("ignora referencias y avisa de lo desconocido", () => {
    const r = parseAbilities("{{tag+|Windrunner}}{{book ref|sa1|3}}, [[Cosa rara]], Avatar of [[Autonomy]]");
    expect(r.ids).toEqual(["windrunner", "avatar-autonomy"]);
    expect(r.unknown).toEqual(["[[cosa rara]]"]);
  });
});

