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
  silverlight: "silverlight", // ciudad del Reino Cognitivo; origen de Iyatil
  dhatri: "dhatri",
};

/** Valor del campo `species` (en minúsculas) -> id de especie concreta de taxonomy.species. */
export const SPECIES: Record<string, string> = {
  human: "human",
  singer: "singer",
  singers: "singer",
  spren: "spren",
  honorspren: "honorspren",
  highspren: "highspren",
  inkspren: "inkspren",
  cryptic: "cryptic",
  cultivationspren: "cultivationspren",
  mistspren: "mistspren",
  peakspren: "peakspren",
  voidspren: "voidspren",
  ashspren: "ashspren",
  reacher: "reacher",
  kandra: "kandra",
  koloss: "koloss",
  seon: "seon",
  inquisitor: "inquisitor",
  "dysian aimian": "dysian-aimian",
  "siah aimian": "siah-aimian",
  dragon: "dragon",
  sleepless: "sleepless",
  "sho del": "sho-del",
  shade: "shade",
  aviar: "aviar",
  ryshadium: "ryshadium",
  larkin: "larkin",
  axehound: "animal",
  chicken: "animal",
  chasmfiend: "animal",
  sheep: "animal",
  "sand fox": "animal",
  skyeel: "animal",
  tonk: "animal",
  parrot: "animal",
};

/** Campo `ethnicity` (en minúsculas) -> pueblo humano (subespecie de "human"). */
export const ETHNICITIES: Record<string, string> = {
  noble: "noble",
  skaa: "skaa",
  terris: "terris",
  daysider: "daysider",
  darksider: "darksider",
  "southern scadrian": "southern-scadrian",
  threnodite: "threnodite",
  alethi: "alethi",
  alethkar: "alethi",
  aonic: "aonic",
  shin: "shin",
  eelakin: "eelakin",
  kerztian: "kerztian",
  grand: "grand",
  duladel: "duladen",
  selay: "selay",
  reshi: "reshi",
  makabaki: "makabaki",
};

/** Campo `nation` (en minúsculas), si no hay etnia -> pueblo humano. */
export const NATIONS: Record<string, string> = {
  alethi: "alethi",
  alethkar: "alethi",
  azir: "azish",
  herdaz: "herdazian",
  iri: "iriali",
  "jah keved": "veden",
  kharbranth: "kharbranthian",
  rira: "riran",
  thaylenah: "thaylen",
  unkalaki: "unkalaki",
  purelake: "selay",
  khlennium: "khlennium",
  terris: "terris",
  arelon: "arelene",
  fjordell: "fjordell",
  fjorden: "fjordell",
  teod: "teo",
  maipon: "maipon",
  jindo: "jindo",
  "rose empire": "rose-empire",
  idris: "idrian",
  hallandren: "hallandren",
  "pahn kahl": "pahn-kahl",
  nagadan: "nagadan",
  torio: "torio",
};

/** Mundo de origen -> pueblo humano, cuando no hay etnia ni nación (los Heraldos vienen de Ashyn). */
export const HOMEWORLD_PEOPLE: Record<string, string> = { ashyn: "ashyn" };

/** Spren genéricos ("Spren"): tipo deducido de la Orden con la que se vinculan. */
export const ORDER_SPREN: Record<string, string> = {
  windrunner: "honorspren",
  lightweaver: "cryptic",
  skybreaker: "highspren",
  truthwatcher: "mistspren",
  stoneward: "peakspren",
  edgedancer: "cultivationspren",
  elsecaller: "inkspren",
  dustbringer: "ashspren",
  willshaper: "reacher",
  bondsmith: "bondsmith-spren",
};

/** Etiqueta `{{tag+|X}}` (en minúsculas) -> id de poder de taxonomy.investiture. */
export const ABILITY_TAGS: Record<string, string> = {
  mistborn: "mistborn",
  misting: "misting",
  allomancer: "allomancy",
  coinshot: "coinshot",
  lurcher: "lurcher",
  tineye: "tineye",
  smoker: "smoker",
  seeker: "seeker",
  soother: "soother",
  rioter: "rioter",
  pewterarm: "thug",
  thug: "thug",
  leecher: "leecher",
  pulser: "pulser",
  slider: "slider",
  augur: "augur",
  oracle: "oracle",
  nicroburst: "nicroburst",
  feruchemist: "feruchemist",
  ferring: "ferring",
  brute: "brute",
  skimmer: "skimmer",
  windwhisperer: "windwhisperer",
  steelrunner: "steelrunner",
  sparker: "sparker",
  bloodmaker: "bloodmaker",
  connector: "connector",
  twinborn: "twinborn",
  hemalurgist: "hemalurgist",
  windrunner: "windrunner",
  lightweaver: "lightweaver",
  skybreaker: "skybreaker",
  truthwatcher: "truthwatcher",
  stoneward: "stoneward",
  edgedancer: "edgedancer",
  elsecaller: "elsecaller",
  dustbringer: "dustbringer",
  willshaper: "willshaper",
  bondsmith: "bondsmith",
  surgebinder: "surgebinder",
  surgebinders: "surgebinder",
  squire: "squire",
  fused: "fused",
  shardbearer: "shardbearer",
  oldmagic: "old-magic",
  elantrian: "elantrian",
  forger: "forger",
  bloodsealer: "bloodsealer",
  awakener: "awakener",
  returned: "returned",
  lifeless: "lifeless",
  nightmare: "nightmare",
  sandmaster: "sandmaster",
  "spore eater": "spore-eater",
  aetherbound: "aetherbound",
  "yoki-hijo": "yoki-hijo",
  "cognitive shadow": "cognitive-shadow",
  herald: "herald",
  worldhopping: "worldhopping",
  worldhopper: "worldhopping",
  savant: "savant",
  seer: "seer",
  charred: "charred",
  sliver: "sliver",
  splinter: "splinter", // con Esquirla: splinter-<esquirla>
  shard: "shard", // con Esquirla: vessel-<esquirla>
  vessel: "shard",
};

/** Etiquetas que se ignoran a propósito (no son un poder). */
export const IGNORED_TAGS = new Set(["honorbearer"]);

/** Enlace `[[X]]` / `[[X|texto]]` (destino en minúsculas) -> id de poder. */
export const ABILITY_LINKS: Record<string, string> = {
  "blessing of presence": "blessing-of-presence",
  "blessing of potency": "blessing-of-potency",
  "blessing of awareness": "blessing-of-awareness",
  "blessing of stability": "blessing-of-stability",
  shardbearer: "shardbearer",
  dakhor: "dakhor",
  "nahel bond": "nahel-bond",
  dawnshard: "dawnshard",
  windrunner: "windrunner",
  lightweaver: "lightweaver",
  skybreaker: "skybreaker",
  truthwatcher: "truthwatcher",
  stoneward: "stoneward",
  edgedancer: "edgedancer",
  elsecaller: "elsecaller",
  dustbringer: "dustbringer",
  willshaper: "willshaper",
  bondsmith: "bondsmith",
  "order of windrunners": "windrunner",
  "order of lightweavers": "lightweaver",
  "order of skybreakers": "skybreaker",
  "order of truthwatchers": "truthwatcher",
  "order of stonewards": "stoneward",
  "order of edgedancers": "edgedancer",
  "order of elsecallers": "elsecaller",
  "order of dustbringers": "dustbringer",
  "order of willshapers": "willshaper",
  "order of bondsmiths": "bondsmith",
  surgebinder: "surgebinder",
  "yolish lightweaving": "yolish-lightweaving",
  soulcaster: "soulcaster",
  soulcasting: "soulcaster",
  fabrial: "fabrial",
  chayshan: "chayshan",
  shardblade: "shardbearer",
  "royal locks": "royal-locks",
  sighted: "sighted",
  regal: "forms-of-power",
  splinter: "splinter",
  sliver: "sliver",
  allomancy: "allomancy",
  feruchemy: "feruchemy",
  hemalurgy: "hemalurgy",
  awakening: "awakening",
  aondor: "aondor",
  forgery: "forgery",
};

/** Texto plano reconocible en el campo de habilidades. */
export const ABILITY_TEXT: [RegExp, string][] = [
  [/avatar of\s*\[\[\s*autonomy/i, "avatar-autonomy"],
  [/\bprecognition\b/i, "precognition"],
];

/** Esquirlas (en minúsculas) -> sufijo de id (vessel-*, splinter-*). */
export const SHARDS = new Set([
  "preservation",
  "ruin",
  "honor",
  "cultivation",
  "odium",
  "autonomy",
  "harmony",
  "devotion",
  "dominion",
  "endowment",
  "retribution",
]);

/** Etiquetas de poder que además determinan la especie. */
export const ABILITY_SPECIES: Record<string, string> = {
  fused: "singer",
  returned: "returned",
  lifeless: "lifeless",
  nightmare: "nightmare",
};

/** Poderes propios de una especie que se añaden siempre. */
export const SPECIES_ABILITIES: Record<string, string[]> = {
  kandra: ["shapeshifter"],
};

/** Especies cuya naturaleza implica un poder, si la ficha no indica ninguno de ese sistema. */
export const SPECIES_INVESTITURE: Record<string, string> = {
  kandra: "blessing", // las Bendiciones son clavos hemalúrgicos
  koloss: "hemalurgy",
  inquisitor: "hemalurgist",
};
