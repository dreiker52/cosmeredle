/**
 * Relevancia de un personaje, medida con señales de la propia Coppermind.
 * Sirve para descartar personajes terciarios (los que salen una o dos veces) que harían el juego imposible.
 */
import { redirectTarget, resolveTitle, type Page } from "./dump";

export interface Relevance {
  /** Páginas de la wiki (artículos) que enlazan al personaje. */
  inbound: number;
  /** Capítulos distintos citados con {{book ref}} en su página. */
  chapters: number;
  /** Longitud del wikitexto de su página. */
  length: number;
}

/** Umbrales. Se queda quien cumpla `minInbound`, o `minInboundWithSupport` más una señal de apoyo. */
export const RELEVANCE = {
  minInbound: 20,
  minInboundWithSupport: 10,
  minChapters: 10,
  minLength: 10_000,
};

export function isRelevant(r: Relevance, t = RELEVANCE): boolean {
  return r.inbound >= t.minInbound || (r.inbound >= t.minInboundWithSupport && (r.chapters >= t.minChapters || r.length >= t.minLength));
}

/** Cuenta, para cada título de `targets`, cuántos artículos distintos lo enlazan (siguiendo redirecciones). */
export function inboundLinks(pages: Map<string, Page>, targets: Set<string>): Map<string, number> {
  const linkers = new Map<string, Set<string>>();
  for (const p of pages.values()) {
    if (p.ns !== 0 || redirectTarget(p.text)) continue;
    for (const m of p.text.matchAll(/\[\[([^\]|#]+)/g)) {
      if (m[1].includes(":")) continue; // categorías, interwikis, archivos
      const t = resolveTitle(pages, m[1]);
      if (t === p.title || !targets.has(t)) continue;
      (linkers.get(t) ?? linkers.set(t, new Set()).get(t)!).add(p.title);
    }
  }
  return new Map([...linkers].map(([t, s]) => [t, s.size]));
}

export function relevanceOf(page: Page, inbound: Map<string, number>): Relevance {
  const chapters = new Set(
    [...page.text.matchAll(/\{\{\s*book ref\s*\|\s*([^}|]+)\|?([^}|]*)/gi)].map((m) => `${m[1]}|${m[2]}`.toLowerCase().trim()),
  ).size;
  return { inbound: inbound.get(page.title) ?? 0, chapters, length: page.text.length };
}
