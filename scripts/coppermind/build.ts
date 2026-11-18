/**
 * Genera data/characters.json a partir del volcado de la Coppermind.
 *
 *   npm run data:fetch   # descarga el volcado (una vez)
 *   npm run data:build   # genera characters.generated.json, aplica overrides.json y escribe characters.json + report.md
 *
 * Solo se extraen datos factuales (mundo, libro, especie, sistema de magia, nombres); el texto de la wiki
 * (licencia CC BY-NC-ND 4.0) nunca se copia al repositorio.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { z } from "zod";
import { Book, Character } from "../../src/data/schema";
import { validateData } from "../../src/data/validate";
import { bookCodes, readDump, redirectTarget, resolveTitle, type Page } from "./dump";
import {
  bookRefCodes,
  findTemplate,
  firstLinkTarget,
  normName,
  slugify,
  spanishTitle,
  splitList,
  stripDisambiguation,
  stripNoise,
  templateFields,
  unlink,
} from "./wikitext";
import {
  ABILITY_SPECIES,
  ETHNICITIES,
  HOMEWORLD_PEOPLE,
  NATIONS,
  ORDER_SPREN,
  SPECIES,
  SPECIES_INVESTITURE,
  WORLDS,
} from "./mappings";
import { parseAbilities } from "./abilities";
import taxonomy from "../../data/taxonomy.json";

const investitureTax = taxonomy.investiture as Record<string, { system?: string }>;
const systemOf = (id: string) => investitureTax[id]?.system ?? id;
import { RELEVANCE, inboundLinks, isRelevant, relevanceOf, type Relevance } from "./relevance";

export const DUMP_PATH = process.env.COPPERMIND_DUMP ?? "data/raw/coppermind-20250225/current.xml";
const DATA = (f: string) => new URL(`../../data/${f}`, import.meta.url);

type Draft = Character & { _title: string; _inferredBook: boolean; _relevance: Relevance };

export interface BuildReport {
  nonCosmere: number;
  excluded: { title: string; reason: string }[];
  inferredBook: { id: string; book: string }[];
  unknownWorlds: Map<string, string[]>;
  unknownSpecies: Map<string, string[]>;
  unknownAbilities: Map<string, string[]>;
  droppedAliases: { id: string; alias: string; reason: string }[];
  irrelevant: { id: string; name: string; book: string; relevance: Relevance }[];
  forcedIncludes: string[];
  orphanOverrides: string[];
}

const push = (m: Map<string, string[]>, k: string, v: string) => m.set(k, [...(m.get(k) ?? []), v]);

export interface ExtractOptions {
  /** ids que se incluyen aunque no pasen el filtro de relevancia. */
  include?: Set<string>;
  /** false = no filtrar por relevancia (útil en tests). */
  filterRelevance?: boolean;
}

export function extractCharacters(
  pages: Map<string, Page>,
  books: Book[],
  { include = new Set(), filterRelevance = true }: ExtractOptions = {},
): { characters: Character[]; report: BuildReport } {
  const report: BuildReport = {
    nonCosmere: 0,
    excluded: [],
    inferredBook: [],
    unknownWorlds: new Map(),
    unknownSpecies: new Map(),
    unknownAbilities: new Map(),
    droppedAliases: [],
    irrelevant: [],
    forcedIncludes: [],
    orphanOverrides: [],
  };

  const pageToBook = new Map(books.map((b) => [resolveTitle(pages, b.coppermindPage ?? b.title.en), b]));
  const codeToBook = new Map<string, Book>();
  for (const [code, title] of bookCodes(pages)) {
    const b = pageToBook.get(title);
    if (b) codeToBook.set(code, b);
  }

  const characterPages = [...pages.values()].filter(
    (p) => p.ns === 0 && !redirectTarget(p.text) && findTemplate(p.text, "character"),
  );
  const inbound = inboundLinks(pages, new Set(characterPages.map((p) => p.title)));

  const drafts: Draft[] = [];
  for (const page of characterPages) {
    const tpl = findTemplate(page.text, "character")!;
    const f = templateFields(tpl);

    const universe = unlink(stripNoise(f.universe ?? "")).toLowerCase();
    const worldRaw = unlink(stripNoise(f.world ?? "")).toLowerCase().trim();
    if (!universe.includes("cosmere") && !WORLDS[worldRaw]) {
      report.nonCosmere++;
      continue;
    }
    if (f.unnamed) {
      report.excluded.push({ title: page.title, reason: "personaje sin nombre (unnamed)" });
      continue;
    }

    // Mundo
    let homeworld = WORLDS[worldRaw];
    if (!homeworld) {
      homeworld = "unknown";
      push(report.unknownWorlds, worldRaw || "(vacío)", page.title);
    }

    // Libro de primera aparición: campo `introduced`, o el libro más antiguo citado en la página.
    let book = f.introduced ? pageToBook.get(resolveTitle(pages, firstLinkTarget(f.introduced))) : undefined;
    let inferred = false;
    if (!book) {
      const cited = bookRefCodes(page.text)
        .map((c) => codeToBook.get(c))
        .filter((b): b is Book => !!b);
      book = cited.sort((a, b) => a.order - b.order)[0];
      inferred = !!book;
    }
    if (!book) {
      report.excluded.push({
        title: page.title,
        reason: f.introduced
          ? `primera aparición fuera de la bibliografía (${unlink(stripNoise(f.introduced))})`
          : "sin libro de primera aparición",
      });
      continue;
    }

    // Poderes / Investidura (tal como los lista la ficha) y especies implícitas
    const abilities = parseAbilities(`${f.abilities ?? ""}, ${f.powers ?? ""}`);
    abilities.unknown.forEach((u) => push(report.unknownAbilities, u, page.title));
    const investiture = [...abilities.ids];
    const species = new Set<string>();
    for (const id of investiture) if (ABILITY_SPECIES[id]) species.add(ABILITY_SPECIES[id]);

    // Especie
    for (const raw of splitList(f.species ?? "")) {
      const mapped = SPECIES[raw.toLowerCase()];
      if (mapped) species.add(mapped);
      else {
        species.add("unknown");
        push(report.unknownSpecies, raw.toLowerCase(), page.title);
      }
    }
    if (species.size === 0) species.add("human");
    // Humanos: pueblo por etnia, nación o mundo de origen.
    if (species.has("human")) {
      const people =
        ETHNICITIES[unlink(stripNoise(f.ethnicity ?? "")).toLowerCase().trim()] ??
        NATIONS[unlink(stripNoise(f.nation ?? "")).toLowerCase().trim()] ??
        HOMEWORLD_PEOPLE[homeworld];
      if (people) {
        species.delete("human");
        species.add(people);
      }
    }
    // Spren genéricos: Deshechos (astillas de Odium) o el tipo de la Orden a la que se vinculan.
    if (species.has("spren")) {
      const subtype = investiture.includes("splinter-odium")
        ? "unmade"
        : investiture.map((i) => ORDER_SPREN[i]).find(Boolean);
      if (subtype) {
        species.delete("spren");
        species.add(subtype);
      }
    }
    for (const s of species) {
      const implied = SPECIES_INVESTITURE[s];
      if (implied && !investiture.some((i) => i === implied || systemOf(i) === systemOf(implied))) investiture.push(implied);
    }

    const name = stripDisambiguation(page.title);
    const es = spanishTitle(page.text);
    const esName = es ? stripDisambiguation(es) : null;
    const aliases = [...new Set([...splitList(f.aliases ?? ""), ...firstNameAlias(name)])].filter(
      (a) => normName(a) !== normName(name),
    );

    drafts.push({
      _title: page.title,
      _inferredBook: inferred,
      _relevance: relevanceOf(page, inbound),
      id: slugify(page.title),
      name,
      aliases,
      homeworld,
      firstAppearance: book.id,
      species: [...species].sort(),
      investiture: investiture.length ? investiture : ["none"],
      ...(abilities.former.length ? { former: abilities.former } : {}),
      coppermindUrl: `https://coppermind.net/wiki/${encodeURI(page.title.replace(/ /g, "_"))}`,
      ...(esName && normName(esName) !== normName(name) ? { i18n: { es: { name: esName } } } : {}),
    });
  }

  // Filtro de relevancia (antes de desambiguar, para que los descartados no "roben" nombres ni alias).
  const kept = drafts.filter((d) => {
    const relevant = !filterRelevance || isRelevant(d._relevance);
    if (!relevant && include.has(d.id)) report.forcedIncludes.push(d.id);
    else if (!relevant)
      report.irrelevant.push({ id: d.id, name: d.name, book: d.firstAppearance, relevance: d._relevance });
    return relevant || include.has(d.id);
  });
  drafts.length = 0;
  drafts.push(...kept);

  disambiguate(drafts);
  dedupeAliases(drafts, report);

  for (const d of drafts) if (d._inferredBook) report.inferredBook.push({ id: d.id, book: d.firstAppearance });
  const characters = drafts
    .map(({ _title, _inferredBook, _relevance, ...c }) => c)
    .sort((a, b) => a.id.localeCompare(b.id));
  return { characters, report };
}

const TITLE_WORDS = new Set(
  "lord lady high king queen prince princess the mother father brother sister captain sir master old young big little mister miss uncle aunt grand".split(" "),
);

/** "Shallan Davar" -> ["Shallan"], para poder buscar por el nombre de pila. Los choques se eliminan después. */
export function firstNameAlias(name: string): string[] {
  const words = name.split(/\s+/);
  if (words.length < 2 || /[(),]/.test(name)) return [];
  const first = words[0];
  return first.length >= 3 && !TITLE_WORDS.has(first.toLowerCase()) ? [first] : [];
}

/** Si dos personajes comparten nombre visible, usan el título completo con desambiguación ("Cob (Mistborn)"). */
function disambiguate(drafts: Draft[]) {
  const byName = new Map<string, Draft[]>();
  for (const d of drafts) byName.set(normName(d.name), [...(byName.get(normName(d.name)) ?? []), d]);
  for (const group of byName.values()) {
    if (group.length < 2) continue;
    for (const d of group) {
      d.name = d._title;
      if (d.i18n?.es?.name) d.i18n.es.name = `${d.i18n.es.name} (${d._title.match(/\(([^)]*)\)$/)?.[1] ?? d.id})`;
    }
  }
}

/** Elimina alias (y nombres en español) que chocan con el nombre o alias de otro personaje. */
function dedupeAliases(drafts: Draft[], report: BuildReport) {
  const owners = new Map<string, Set<string>>();
  const add = (n: string, id: string) => owners.set(normName(n), (owners.get(normName(n)) ?? new Set()).add(id));
  for (const d of drafts) {
    add(d.name, d.id);
    if (d.i18n?.es?.name) add(d.i18n.es.name, d.id);
    d.aliases.forEach((a) => add(a, d.id));
  }
  const primary = new Map(drafts.map((d) => [normName(d.name), d.id]));
  for (const d of drafts) {
    d.aliases = d.aliases.filter((a) => {
      const n = normName(a);
      const shared = (owners.get(n)?.size ?? 0) > 1;
      if (shared) report.droppedAliases.push({ id: d.id, alias: a, reason: primary.has(n) ? "es el nombre de otro personaje" : "compartido con otro personaje" });
      return !shared;
    });
    const es = d.i18n?.es?.name;
    if (es && (owners.get(normName(es))?.size ?? 0) > 1) {
      report.droppedAliases.push({ id: d.id, alias: es, reason: "nombre en español compartido" });
      delete d.i18n;
    }
  }
}

const Override = Character.partial().extend({ exclude: z.boolean().optional(), include: z.boolean().optional() });
/** Claves que empiezan por "_" son comentarios y se ignoran. */
const Overrides = z
  .record(z.string(), z.unknown())
  .transform((o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith("_"))))
  .pipe(z.record(z.string(), Override));

/** Aplica las correcciones. Las que apuntan a un id que no existe (p. ej. descartado por relevancia) se ignoran. */
export function applyOverrides(
  characters: Character[],
  overrides: z.infer<typeof Overrides>,
  orphans: string[] = [],
): Character[] {
  const byId = new Map(characters.map((c) => [c.id, c]));
  for (const [id, o] of Object.entries(overrides)) {
    const { exclude, include: _include, ...patch } = o;
    const base = byId.get(id);
    if (!base) {
      if (!exclude) orphans.push(id);
      continue;
    }
    if (exclude) byId.delete(id);
    else byId.set(id, { ...base, ...patch, id });
  }
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function renderReport(r: BuildReport, final: Character[], books: Book[]): string {
  const count = <T,>(xs: T[], key: (x: T) => string) =>
    [...xs.reduce((m, x) => m.set(key(x), (m.get(key(x)) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]);
  const title = (id: string) => books.find((b) => b.id === id)?.title.es ?? id;
  const mapSection = (name: string, m: Map<string, string[]>) =>
    `## ${name} (${m.size})\n\n` +
    ([...m].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `- \`${k}\` (${v.length}): ${v.slice(0, 8).join(", ")}${v.length > 8 ? "…" : ""}`).join("\n") || "_Ninguno._") +
    "\n";
  return [
    "# Informe de datos (generado por `npm run data:build`)",
    "",
    `- Personajes finales: **${final.length}**`,
    `- Descartados por no ser del Cosmere: ${r.nonCosmere}`,
    `- Excluidos: ${r.excluded.length}`,
    `- Primera aparición deducida de las citas (revisar): ${r.inferredBook.length}`,
    `- Alias eliminados por duplicados: ${r.droppedAliases.length}`,
    `- Descartados por poca relevancia: ${r.irrelevant.length} (incluidos a mano: ${r.forcedIncludes.length})`,
    `- Overrides sin personaje (ignorados): ${r.orphanOverrides.length ? r.orphanOverrides.join(", ") : "ninguno"}`,
    "",
    `Regla de relevancia: lo enlazan ≥ ${RELEVANCE.minInbound} páginas, o ≥ ${RELEVANCE.minInboundWithSupport} páginas y además cita ≥ ${RELEVANCE.minChapters} capítulos o su página tiene ≥ ${RELEVANCE.minLength} caracteres. Para rescatar a alguien: \`"id": { "include": true }\` en overrides.json.`,
    "",
    "## Por mundo",
    "",
    ...count(final, (c) => c.homeworld).map(([k, n]) => `- ${k}: ${n}`),
    "",
    "## Por libro de primera aparición",
    "",
    ...count(final, (c) => c.firstAppearance).map(([k, n]) => `- ${title(k)}: ${n}`),
    "",
    "## Por Investidura",
    "",
    ...count(final.flatMap((c) => c.investiture.map((i) => ({ i }))), (x) => x.i).map(([k, n]) => `- ${k}: ${n}`),
    "",
    mapSection("Mundos no reconocidos → unknown", r.unknownWorlds),
    mapSection("Especies no reconocidas → unknown", r.unknownSpecies),
    mapSection("Etiquetas de habilidad sin clasificar (ignoradas)", r.unknownAbilities),
    `## Traducciones de la taxonomía por verificar\n`,
    "Marcadas con `verify` en data/taxonomy.json: comprobar con las ediciones en español y quitar la marca.\n",
    ...Object.entries(taxonomy as Record<string, Record<string, { es: string; en: string; verify?: boolean }>>).flatMap(
      ([cat, entries]) =>
        Object.entries(entries)
          .filter(([, e]) => e.verify)
          .map(([id, e]) => `- ${cat}.${id}: ${e.en} → **${e.es}**`),
    ),
    "",
    `## Descartados por relevancia más cercanos al corte (top 60)\n`,
    "| id | nombre | primera aparición | enlaces | capítulos | longitud |",
    "|---|---|---|---|---|---|",
    ...[...r.irrelevant]
      .sort((a, b) => b.relevance.inbound * 2 + b.relevance.chapters - (a.relevance.inbound * 2 + a.relevance.chapters))
      .slice(0, 60)
      .map((x) => `| ${x.id} | ${x.name} | ${title(x.book)} | ${x.relevance.inbound} | ${x.relevance.chapters} | ${x.relevance.length} |`),
    "",
    `## Excluidos (${r.excluded.length})\n`,
    ...count(r.excluded, (e) => e.reason).map(([k, n]) => `- ${k}: ${n}`),
    "",
    `<details><summary>Lista completa</summary>\n\n${r.excluded.map((e) => `- ${e.title}: ${e.reason}`).join("\n")}\n\n</details>\n`,
    `## Primera aparición deducida (${r.inferredBook.length})\n`,
    `<details><summary>Lista</summary>\n\n${r.inferredBook.map((x) => `- ${x.id}: ${title(x.book)}`).join("\n")}\n\n</details>\n`,
    `## Alias eliminados (${r.droppedAliases.length})\n`,
    `<details><summary>Lista</summary>\n\n${r.droppedAliases.map((x) => `- ${x.id}: "${x.alias}" (${x.reason})`).join("\n")}\n\n</details>\n`,
  ].join("\n");
}

function main() {
  if (!existsSync(DUMP_PATH)) {
    console.error(`No se encuentra el volcado en ${DUMP_PATH}. Ejecuta primero: npm run data:fetch`);
    process.exit(1);
  }
  const read = (f: string) => JSON.parse(readFileSync(DATA(f), "utf8"));
  const books = z.array(Book).parse(read("books.json"));
  const overrides = Overrides.parse(existsSync(DATA("overrides.json")) ? read("overrides.json") : {});

  console.log("Leyendo volcado…");
  const pages = readDump(DUMP_PATH);
  const include = new Set(Object.entries(overrides).filter(([, o]) => o.include).map(([id]) => id));
  const { characters, report } = extractCharacters(pages, books, { include });
  const final = applyOverrides(characters, overrides, report.orphanOverrides);

  const json = (x: unknown) => JSON.stringify(x, null, 2) + "\n";
  writeFileSync(DATA("characters.generated.json"), json(characters));
  writeFileSync(DATA("characters.json"), json(final));
  writeFileSync(DATA("report.md"), renderReport(report, final, books));

  const errors = validateData({ taxonomy: read("taxonomy.json"), books, characters: final });
  console.log(`✓ ${final.length} personajes (${characters.length} generados, ${Object.keys(overrides).length} overrides)`);
  console.log(`  Informe: data/report.md`);
  if (errors.length) {
    console.error(`✗ ${errors.length} error(es) de validación:\n` + errors.slice(0, 30).map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith("build.ts")) main();
