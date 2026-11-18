/**
 * Utilidades mínimas para leer wikitexto de MediaWiki (plantillas, enlaces, referencias).
 * No es un parser completo: solo cubre lo necesario para las fichas de personaje.
 */

/** Devuelve el texto completo de la primera plantilla `{{name ...}}` (con llaves anidadas), o null. */
export function findTemplate(text: string, name: string): string | null {
  const re = new RegExp(`\\{\\{\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(\\||\\}\\}|\\n)`, "i");
  const m = re.exec(text);
  if (!m) return null;
  let depth = 0;
  for (let i = m.index; i < text.length; ) {
    if (text.startsWith("{{", i)) {
      depth++;
      i += 2;
    } else if (text.startsWith("}}", i)) {
      depth--;
      i += 2;
      if (depth === 0) return text.slice(m.index, i);
    } else i++;
  }
  return null;
}

/** Separa los parámetros `|clave=valor` de una plantilla, respetando plantillas y enlaces anidados. */
export function templateFields(template: string): Record<string, string> {
  const body = template.slice(2, -2);
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < body.length; ) {
    const two = body.slice(i, i + 2);
    if (two === "{{" || two === "[[") {
      depth++;
      cur += two;
      i += 2;
    } else if (two === "}}" || two === "]]") {
      depth--;
      cur += two;
      i += 2;
    } else if (body[i] === "|" && depth === 0) {
      parts.push(cur);
      cur = "";
      i++;
    } else {
      cur += body[i++];
    }
  }
  parts.push(cur);
  const out: Record<string, string> = {};
  for (const p of parts.slice(1)) {
    const eq = p.indexOf("=");
    if (eq === -1) continue;
    const key = p.slice(0, eq).trim().replace(/^['#]+/, ""); // algunas fichas tienen claves con erratas ("'species")
    const value = p.slice(eq + 1).trim();
    if (key && value && !(key in out)) out[key] = value;
  }
  return out;
}

/** Quita referencias, comentarios y etiquetas HTML pequeñas, dejando el texto del valor. */
export function stripNoise(value: string): string {
  return value
    .replace(/<ref[^>]*\/>/gis, "")
    .replace(/<ref[^>]*>.*?<\/ref>/gis, "")
    .replace(/<!--.*?-->/gs, "")
    .replace(/\{\{(?:book ref|wob ref|epigraph ref|cite|url ref|tor ref|bws ref|msh ref|au ref|tes ref)[^{}]*\}\}/gi, "")
    .replace(/<small>.*?<\/small>/gis, "")
    .replace(/<br\s*\/?>/gi, ", ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/** Convierte `[[Destino|texto]]` en `texto` y `[[Destino]]` en `Destino`. */
export function unlink(value: string): string {
  return value.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, target: string, text?: string) =>
    (text ?? target).trim(),
  );
}

/** Primer destino de enlace `[[Destino|...]]` de un valor, o el valor limpio si no hay enlace. */
export function firstLinkTarget(value: string): string {
  const m = /\[\[([^\]|#]+)/.exec(value);
  return (m ? m[1] : stripNoise(value)).trim();
}

/** Etiquetas `{{tag|X}}` / `{{tag+|X}}` / `{{tag+|X|Y}}` en minúsculas (solo el primer argumento). */
export function tags(value: string): string[] {
  return [...value.matchAll(/\{\{\s*(?:cat )?tag\+?\s*\|\s*([^}|]+)/gi)].map((m) => m[1].trim().toLowerCase());
}

/** Códigos de libro citados con `{{book ref|código|...}}` en una página. */
export function bookRefCodes(text: string): string[] {
  return [...text.matchAll(/\{\{\s*book ref\s*\|\s*([^}|]+)/gi)].map((m) => m[1].trim().toLowerCase());
}

/** Enlace interidioma a la wiki en español (`[[es:Título]]`), sin espacios sobrantes. */
export function spanishTitle(text: string): string | null {
  const m = /\[\[es:([^\]]+)\]\]/.exec(text);
  return m ? m[1].replace(/_/g, " ").trim() : null;
}

/** Lista separada por comas, limpia de enlaces/plantillas/ruido. */
export function splitList(value: string): string[] {
  return unlink(stripNoise(value))
    .replace(/\{\{[^{}]*\}\}/g, "")
    .split(/,|;/)
    .map((s) => s.replace(/''+/g, "").trim())
    .filter(Boolean);
}

/** Quita la desambiguación final: "Cob (Mistborn)" -> "Cob". */
export const stripDisambiguation = (title: string): string => title.replace(/\s*\([^)]*\)\s*$/, "").trim();

/** id estable a partir de un título: minúsculas, sin acentos, guiones. */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Normaliza para comparar nombres: sin acentos, minúsculas, espacios simples. */
export const normName = (s: string): string =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
