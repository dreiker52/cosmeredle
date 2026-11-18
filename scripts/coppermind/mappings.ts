/**
 * Tablas que traducen los valores de las fichas de la Coppermind a los ids de data/taxonomy.json.
 * Cualquier valor que no aparezca aquí se anota en data/report.md para revisarlo.
 */

/** Valor del campo `world` (en minúsculas) -> id de mundo. */
export const WORLDS: Record<string, string> = {
  roshar: "roshar",
  scadrial: "scadrial",
  sel: "sel",
  nalthis: "nalthis",
  taldain: "taldain",
  threnody: "threnody",
  "first of the sun": "first-of-the-sun",
  lumar: "lumar",
  komashi: "komashi",
  canticle: "canticle",
  yolen: "yolen",
  braize: "braize",
  ashyn: "ashyn",
};

/** Valor del campo `species` (en minúsculas) -> ids de especie. */
export const SPECIES: Record<string, string[]> = {
  human: ["human"],
  singer: ["singer"],
  singers: ["singer"],
  spren: ["spren"],
  honorspren: ["spren"],
  highspren: ["spren"],
  inkspren: ["spren"],
  cryptic: ["spren"],
  cultivationspren: ["spren"],
  mistspren: ["spren"],
  peakspren: ["spren"],
  voidspren: ["spren"],
  ashspren: ["spren"],
  reacher: ["spren"],
  kandra: ["kandra"],
  koloss: ["koloss"],
  seon: ["seon"],
  inquisitor: ["human"], // los Inquisidores de Acero son humanos con Hemalurgia
  "dysian aimian": ["aimian"],
  "siah aimian": ["aimian"],
  dragon: ["dragon"],
  sleepless: ["sleepless"],
  "sho del": ["sho-del"],
  shade: ["shade"],
  aviar: ["aviar"],
  ryshadium: ["ryshadium"],
  larkin: ["larkin"],
  axehound: ["animal"],
  chicken: ["animal"],
  chasmfiend: ["animal"],
  sheep: ["animal"],
  "sand fox": ["animal"],
  skyeel: ["animal"],
  tonk: ["animal"],
  parrot: ["animal"],
};

/**
 * Etiqueta de habilidad (`{{tag+|X}}`, en minúsculas) -> ids de Investidura.
 * Algunas etiquetas implican también una especie (ver ABILITY_SPECIES).
 */
export const ABILITIES: Record<string, string[]> = {
  // Alomancia
  mistborn: ["allomancy"],
  misting: ["allomancy"],
  allomancer: ["allomancy"],
  coinshot: ["allomancy"],
  lurcher: ["allomancy"],
  tineye: ["allomancy"],
  smoker: ["allomancy"],
  seeker: ["allomancy"],
  soother: ["allomancy"],
  rioter: ["allomancy"],
  pewterarm: ["allomancy"],
  thug: ["allomancy"],
  leecher: ["allomancy"],
  pulser: ["allomancy"],
  slider: ["allomancy"],
  augur: ["allomancy"],
  oracle: ["allomancy"],
  nicroburst: ["allomancy"],
  // Feruquimia
  feruchemist: ["feruchemy"],
  ferring: ["feruchemy"],
  brute: ["feruchemy"],
  skimmer: ["feruchemy"],
  windwhisperer: ["feruchemy"],
  steelrunner: ["feruchemy"],
  sparker: ["feruchemy"],
  bloodmaker: ["feruchemy"],
  connector: ["feruchemy"],
  // Ambas
  twinborn: ["allomancy", "feruchemy"],
  // Hemalurgia
  hemalurgist: ["hemalurgy"],
  // Roshar
  windrunner: ["surgebinding"],
  lightweaver: ["surgebinding"],
  skybreaker: ["surgebinding"],
  truthwatcher: ["surgebinding"],
  stoneward: ["surgebinding"],
  edgedancer: ["surgebinding"],
  elsecaller: ["surgebinding"],
  dustbringer: ["surgebinding"],
  willshaper: ["surgebinding"],
  bondsmith: ["surgebinding"],
  surgebinder: ["surgebinding"],
  surgebinders: ["surgebinding"],
  squire: ["surgebinding"],
  fused: ["voidbinding"],
  shardbearer: ["shardbearer"],
  oldmagic: ["old-magic"],
  // Sel
  elantrian: ["aondor"],
  forger: ["forgery"],
  bloodsealer: ["bloodsealing"],
  // Nalthis
  awakener: ["awakening"],
  returned: ["awakening"],
  // Taldain
  sandmaster: ["sand-mastery"],
  // Lumar / Canticle
  "spore eater": ["aether"],
  aetherbound: ["aether"],
  // Komashi
  "yoki-hijo": ["yoki-hijo"],
};

/** Etiquetas de habilidad que además determinan la especie. */
export const ABILITY_SPECIES: Record<string, string> = {
  fused: "singer",
  returned: "returned",
  lifeless: "lifeless",
  nightmare: "nightmare",
};

/**
 * Etiquetas que se ignoran a propósito: no son un sistema de magia o suelen ser spoilers
 * (Esquirlas, Vasijas, Sombras Cognitivas, astillas...).
 */
export const IGNORED_ABILITIES = new Set([
  "splinter",
  "shard",
  "vessel",
  "sliver",
  "cognitive shadow",
  "worldhopping",
  "worldhopper",
  "honorbearer",
  "savant",
  "herald",
  "charred",
  "seer",
  "lifeless",
  "nightmare",
]);

/**
 * Enlaces de wiki (`[[X]]` o `[[X|texto]]`, destino en minúsculas) en el campo de habilidades
 * que indican un sistema de Investidura. Muchas fichas usan enlaces en vez de `{{tag}}`.
 */
export const ABILITY_LINKS: Record<string, string[]> = {
  "blessing of presence": ["hemalurgy"],
  "blessing of potency": ["hemalurgy"],
  "blessing of awareness": ["hemalurgy"],
  "blessing of stability": ["hemalurgy"],
  shardbearer: ["shardbearer"],
  dakhor: ["dakhor"],
  "nahel bond": ["surgebinding"], // spren vinculados: otorgan la Potenciación
  dawnshard: ["dawnshard"],
  allomancy: ["allomancy"],
  feruchemy: ["feruchemy"],
  hemalurgy: ["hemalurgy"],
  awakening: ["awakening"],
  aondor: ["aondor"],
  forgery: ["forgery"],
};

/** Especies cuya naturaleza implica un sistema de Investidura. */
export const SPECIES_INVESTITURE: Record<string, string[]> = {
  kandra: ["hemalurgy"], // las Bendiciones son clavos hemalúrgicos
  koloss: ["hemalurgy"],
};

/**
 * Heraldos (título de página). La etiqueta "cognitive shadow" no se puede usar en general porque en
 * otros personajes es spoiler; en los Heraldos es su naturaleza conocida desde el primer libro.
 * Sus Hojas de Honor les dan Potenciación.
 */
export const HERALDS = new Set([
  "Jezrien",
  "Nale",
  "Chanarach",
  "Vedel",
  "Pralla",
  "Shalash",
  "Battar",
  "Kalak",
  "Talenel",
  "Ishar",
]);
