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
    page("TenSoon", "{{character\n|species=kandra\n|world=Scadrial\n|universe=[[Cosmere]]\n|introduced=[[The Well of Ascension]]\n}}"),
  ]);

  it("resuelve redirecciones y códigos de libro", () => {
    expect(resolveTitle(pages, "the Final Empire")).toBe("Mistborn: The Final Empire");
    expect(bookCodes(pages).get("tfe")).toBe("Mistborn: The Final Empire");
  });

  const { characters, report } = extractCharacters(pages, books);
  const byId = new Map(characters.map((c) => [c.id, c]));

  it("extrae y normaliza los campos", () => {
    expect(byId.get("vin")).toMatchObject({
      name: "Vin",
      homeworld: "scadrial",
      firstAppearance: "mistborn-1",
      species: ["human"],
      investiture: ["allomancy"], // la etiqueta shard se ignora
      aliases: ["Valette Renoux"],
      coppermindUrl: "https://coppermind.net/wiki/Vin",
    });
    expect(byId.get("vin")?.i18n).toBeUndefined(); // mismo nombre en español
    expect(byId.get("tensoon")).toMatchObject({ species: ["kandra"], investiture: ["none"] });
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
});
