import { z } from "zod";

const Localized = z.object({ es: z.string().min(1), en: z.string().min(1) });

export const Book = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(), // orden de publicación dentro del Cosmere
  year: z.number().int(),
  series: z.string().min(1), // id de taxonomy.series
  title: Localized,
});

export const Taxonomy = z.object({
  worlds: z.record(z.string(), Localized),
  species: z.record(z.string(), Localized),
  investiture: z.record(z.string(), Localized),
  series: z.record(z.string(), Localized),
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
  investitureDetail: z.array(z.string()).optional(),
  coppermindUrl: z.string().url(),
  i18n: z.object({ es: LocalizedNames.optional(), en: LocalizedNames.optional() }).optional(),
  spoilerNotes: z.string().optional(), // interno, nunca se muestra
});

export type Book = z.infer<typeof Book>;
export type Taxonomy = z.infer<typeof Taxonomy>;
export type Character = z.infer<typeof Character>;
