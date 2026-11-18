import { z } from "zod";

const Localized = z.object({ es: z.string().min(1), en: z.string().min(1) });

export const Book = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(), // orden de publicación dentro del Cosmere
  year: z.number().int(),
  series: z.string().min(1), // id de taxonomy.series
  title: Localized,
  coppermindPage: z.string().optional(), // título de la página del libro en la Coppermind
});

/** `verify`: traducción al español pendiente de comprobar con las ediciones publicadas. */
const TaxonomyEntry = Localized.extend({ verify: z.boolean().optional() });

export const Taxonomy = z.object({
  worlds: z.record(z.string(), TaxonomyEntry),
  // Especie concreta; `group` es la especie general (p. ej. "alethi" -> "human", "unmade" -> "spren").
  species: z.record(z.string(), TaxonomyEntry.extend({ group: z.string().optional() })),
  // Habilidad concreta; `system` es el sistema de Investidura (p. ej. "mistborn" -> "allomancy").
  investiture: z.record(z.string(), TaxonomyEntry.extend({ system: z.string().optional() })),
  series: z.record(z.string(), TaxonomyEntry),
});

const LocalizedNames = z.object({
  name: z.string().optional(),
  aliases: z.array(z.string()).optional(),
});

export const Character = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  aliases: z.array(z.string()),
  homeworld: z.string().min(1), // id de taxonomy.worlds
  firstAppearance: z.string().min(1), // id de books.json
  species: z.array(z.string()).min(1), // ids de taxonomy.species; ["unknown"] si no se sabe
  investiture: z.array(z.string()).min(1), // ids de taxonomy.investiture; ["none"] / ["unknown"]
  coppermindUrl: z.string().url(),
  i18n: z.object({ es: LocalizedNames.optional(), en: LocalizedNames.optional() }).optional(),
  spoilerNotes: z.string().optional(), // interno, nunca se muestra
});

export type Book = z.infer<typeof Book>;
export type Taxonomy = z.infer<typeof Taxonomy>;
export type Character = z.infer<typeof Character>;
