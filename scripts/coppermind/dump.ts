/**
 * Lectura del volcado XML de la Coppermind (generado por WikiTeam y alojado en archive.org).
 */
import { readFileSync } from "node:fs";

export interface Page {
  title: string;
  ns: number;
  text: string;
}

const ENTITIES: Record<string, string> = { "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#039;": "'", "&apos;": "'" };
const decode = (s: string) => s.replace(/&(lt|gt|quot|#039|apos);/g, (e) => ENTITIES[e]).replace(/&amp;/g, "&");

/** Lee todas las páginas (última revisión) del volcado. */
export function readDump(path: string): Map<string, Page> {
  const xml = readFileSync(path, "utf8");
  const pages = new Map<string, Page>();
  const re = /<page>\s*<title>([^<]*)<\/title>\s*<ns>(\d+)<\/ns>[\s\S]*?<text[^>]*?(?:\/>|>([\s\S]*?)<\/text>)/g;
  for (const m of xml.matchAll(re)) {
    const title = decode(m[1]);
    pages.set(title, { title, ns: Number(m[2]), text: decode(m[3] ?? "") });
  }
  return pages;
}

/** Destino de una redirección (`#REDIRECT [[X]]`), o null si la página no lo es. */
export function redirectTarget(text: string): string | null {
  const m = /^\s*#redirect\s*\[\[([^\]|#]+)/i.exec(text);
  return m ? m[1].trim() : null;
}

/** Sigue redirecciones (máx. 5 saltos) y normaliza la primera letra a mayúscula como hace MediaWiki. */
export function resolveTitle(pages: Map<string, Page>, title: string): string {
  let t = title.replace(/_/g, " ").trim();
  t = t.charAt(0).toUpperCase() + t.slice(1);
  for (let i = 0; i < 5; i++) {
    const target = pages.get(t) && redirectTarget(pages.get(t)!.text);
    if (!target) break;
    t = target.charAt(0).toUpperCase() + target.slice(1);
  }
  return t;
}

/**
 * Lee la plantilla {{b}} de la Coppermind, que traduce códigos de libro (`mb1`, `sa5`, `tfe`...)
 * al título de la página del libro. Devuelve código -> título.
 */
export function bookCodes(pages: Map<string, Page>): Map<string, string> {
  const text = pages.get("Template:B")?.text ?? "";
  const map = new Map<string, string>();
  for (const m of text.matchAll(/-->\|([^=<>\n]+)=([^<\n]*)<!--/g)) {
    let title = m[2]
      .replace(/\{\{b\/[^}]*\}\}/g, "")
      .replace(/\{\{#if:\{\{\{text\|\}\}\}\|[^|]*\|([^}]*)\}\}/, "$1")
      .trim();
    if (!title) continue;
    title = resolveTitle(pages, title);
    for (const code of m[1].split("|")) if (code.trim()) map.set(code.trim().toLowerCase(), title);
  }
  return map;
}
