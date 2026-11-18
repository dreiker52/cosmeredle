/**
 * Lectura del campo de habilidades de la ficha de personaje de la Coppermind, p. ej.
 *   {{tag+|Mistborn}} <small>(formerly)</small>, {{tag+|Sliver}}, {{tag+|shard|Preservation}}, [[Blessing of Potency]]
 */
import { ABILITY_LINKS, ABILITY_TAGS, ABILITY_TEXT, IGNORED_TAGS, SHARDS } from "./mappings";

export interface ParsedAbilities {
  /** ids de poder, en el orden de la ficha y sin repetir. */
  ids: string[];
  /** Etiquetas o enlaces que no se han reconocido (para el informe). */
  unknown: string[];
}

/**
 * Quita las referencias y los `<small>`. Un poder que ya no tiene ("(formerly)") cuenta como si lo
 * tuviera; si el `<small>` contiene etiquetas ("({{tag+|Savant}}, formerly)"), se conservan.
 */
function preprocess(text: string): string {
  let t = text.replace(/\{\{\s*(?:book|wob|cite|ref)[^{}]*\}\}/gi, "").replace(/<ref[^>]*\/>|<ref[\s\S]*?<\/ref>/gi, "");
  t = t.replace(/\{\{\s*nosnippet\s*\|/gi, "{{nosnippet|");
  return t.replace(/<small>([\s\S]*?)<\/small>/gi, (_, inner: string) => {
    if (!/formerly/i.test(inner)) return "";
    const tags = [...inner.matchAll(/\{\{\s*tag\+?\s*\|[^}]*\}\}/gi)].map((m) => m[0]);
    return tags.length ? ", " + tags.join(", ") : "";
  });
}

interface Token {
  start: number;
  end: number;
  kind: "tag" | "link";
  name: string; // en minúsculas
  param?: string;
}

function tokenize(t: string): Token[] {
  const tokens: Token[] = [];
  for (const m of t.matchAll(/\{\{\s*(?:cat )?tag\+?\s*\|\s*([^}|]+)(?:\|([^}|]+))?[^}]*\}\}/gi)) {
    const param = m[2]?.trim();
    tokens.push({
      start: m.index!,
      end: m.index! + m[0].length,
      kind: "tag",
      name: m[1].trim().toLowerCase(),
      param: param && !param.includes("=") ? param : undefined,
    });
  }
  for (const m of t.matchAll(/\[\[\s*([^\]|#]*)(?:\|[^\]]*)?\]\]/g)) {
    tokens.push({ start: m.index!, end: m.index! + m[0].length, kind: "link", name: m[1].replace(/_/g, " ").trim().toLowerCase() });
  }
  return tokens.sort((a, b) => a.start - b.start);
}

/** "of [[Odium]]", "of Honor and Cultivation"... justo detrás de una astilla. */
function shardsAfter(rest: string): string[] {
  const m = /^\s*of\s+((?:\[\[[^\]]+\]\]|[A-Za-z]+)(?:\s*(?:and|&|,)\s*(?:\[\[[^\]]+\]\]|[A-Za-z]+))*)/i.exec(rest);
  if (!m) return [];
  return [...m[1].matchAll(/\[\[\s*([^\]|]+)|([A-Za-z]+)/g)]
    .map((x) => (x[1] ?? x[2]).trim().toLowerCase())
    .filter((x) => SHARDS.has(x));
}

export function parseAbilities(text: string): ParsedAbilities {
  const t = preprocess(text);
  const tokens = tokenize(t);
  const ids: string[] = [];
  const unknown: string[] = [];
  const consumed = new Set<number>(); // enlaces usados como nombre de Esquirla

  tokens.forEach((tok, i) => {
    if (consumed.has(tok.start)) return;
    let found: string[] = [];

    if (tok.kind === "tag") {
      const base = ABILITY_TAGS[tok.name];
      if (!base) {
        if (!IGNORED_TAGS.has(tok.name)) unknown.push(`{{tag|${tok.name}}}`);
        return;
      }
      const shardParam = tok.param?.toLowerCase();
      if ((base === "shard" || base === "splinter") && shardParam && SHARDS.has(shardParam)) {
        found = [`${base === "shard" ? "vessel" : "splinter"}-${shardParam}`];
      } else if (base === "splinter") {
        const after = shardsAfter(t.slice(tok.end));
        found = after.length ? after.map((s) => `splinter-${s}`) : ["splinter"];
        // Los enlaces a la Esquirla que siguen ("of [[Odium]]") no son poderes.
        tokens.slice(i + 1).filter((x) => x.kind === "link" && SHARDS.has(x.name)).slice(0, after.length).forEach((x) => consumed.add(x.start));
      } else {
        found = [base];
      }
    } else {
      const id = ABILITY_LINKS[tok.name];
      if (id === "splinter") {
        const after = shardsAfter(t.slice(tok.end));
        found = after.length ? after.map((s) => `splinter-${s}`) : ["splinter"];
      } else if (id) {
        found = [id];
      } else if (!SHARDS.has(tok.name)) {
        unknown.push(`[[${tok.name}]]`);
        return;
      } else return;
    }

    for (const id of found) if (!ids.includes(id)) ids.push(id);
  });

  for (const [re, id] of ABILITY_TEXT) if (re.test(t) && !ids.includes(id)) ids.push(id);
  return { ids, unknown };
}
