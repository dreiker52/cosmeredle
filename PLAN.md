# Cosmeredle — Plan de proyecto

> Juego diario de adivinar un personaje del Cosmere (el universo compartido de Brandon Sanderson) a partir de sus atributos: nombre, mundo de origen, libro de primera aparición, especie y poderes/Investidura.
> Proyecto personal, sin ánimo de lucro, alojado gratis en **GitHub Pages** (coste **0 €**).

---

## Índice

1. [Concepto y objetivos](#1-concepto-y-objetivos)
2. [Atributos del modo clásico](#2-atributos-del-modo-clásico)
3. [Spoilers](#3-spoilers)
4. [Datos: fuente, esquema y curación](#4-datos-fuente-esquema-y-curación)
5. [Arquitectura técnica](#5-arquitectura-técnica)
6. [Lógica del juego](#6-lógica-del-juego)
7. [Diseño visual y UX](#7-diseño-visual-y-ux)
8. [Idioma: toggle ES / EN](#8-idioma-toggle-es--en)
9. [Hosting en GitHub Pages y costes](#9-hosting-en-github-pages-y-costes)
10. [Aspectos legales](#10-aspectos-legales)
11. [Testing y calidad](#11-testing-y-calidad)
12. [Fases y hoja de ruta](#12-fases-y-hoja-de-ruta)
13. [Riesgos y mitigaciones](#13-riesgos-y-mitigaciones)
14. [Ideas futuras (fuera de alcance)](#14-ideas-futuras-fuera-de-alcance)
15. [Checklist de lanzamiento](#15-checklist-de-lanzamiento)

---

## 1. Concepto y objetivos

### Alcance
- **Solo el modo clásico.** No hay otros modos de juego por ahora.
- **Personajes relevantes del Cosmere**: protagonistas y secundarios memorables (~270). Los terciarios, que salen una o dos veces, se descartan porque harían el juego imposible (ver 4.2).

### Mecánica
- Cada día hay **un personaje secreto**, el mismo para todos los jugadores.
- El jugador escribe el nombre de un personaje (con autocompletado) y recibe una fila con sus atributos coloreados:
  - 🟩 **Verde**: coincide exactamente.
  - 🟨 **Amarillo**: coincidencia parcial (p. ej. comparten uno de varios poderes, o el libro es de la misma saga).
  - 🟥 **Rojo**: no coincide.
  - ⬆️⬇️ **Flechas**: en el libro de primera aparición, indican si el objetivo apareció en un libro publicado antes o después.
- **Intentos ilimitados.** El número de intentos se muestra en el resultado compartido. Con ~270 personajes en juego, limitarlos haría el juego demasiado difícil.
- Al acertar se muestra la tarjeta del personaje (atributos + enlace a la Coppermind), una cuenta atrás hasta el siguiente y el botón **Compartir**.

### Objetivos
- Jugable en móvil y escritorio, sin registro y con carga rápida.
- Interfaz en **español e inglés**, con un toggle para cambiar de idioma.
- **0 €** de infraestructura: sitio estático en GitHub Pages.
- Mantenimiento casi nulo: el personaje del día se calcula solo, sin intervención diaria.

### No-objetivos
- Otros modos de juego (cita, poder, silueta...).
- Cuentas de usuario, rankings globales o backend propio.
- Monetización.

---

## 2. Atributos del modo clásico

Cinco columnas:

| # | Atributo | Tipo | Comparación | Ejemplos de valores |
|---|---|---|---|---|
| 1 | **Nombre** | identificador | 🟩 solo si es el personaje correcto; 🟥 en cualquier otro caso | Vin, Kaladin, Sarene, Hoid |
| 2 | **Mundo de origen** | único | 🟩 igual / 🟥 distinto | Roshar, Scadrial, Sel, Nalthis, Taldain, Threnodia, Lumar, Komashi, Canticle, Yolen, Desconocido |
| 3 | **Libro de primera aparición** | ordenable + agrupado | 🟩 mismo libro / 🟨 misma saga, otro libro / 🟥 otra saga; **más** ⬆️⬇️ según el orden de publicación | *El Imperio Final*, *El Camino de los Reyes*, *Elantris*, *El aliento de los dioses* |
| 4 | **Especie** | multi | 🟩 todas coinciden / 🟨 alguna coincide / 🟥 ninguna | Humano, Cantor, Spren, Kandra, Koloss, Retornado, Sombra cognitiva, Dragón, Aimiano |
| 5 | **Poderes / Investidura** | multi | 🟩 todos coinciden / 🟨 alguno coincide / 🟥 ninguno | Alomancia, Feruquimia, Hemalurgia, Potenciación, AonDor, Despertar, Forja de almas, Ninguno, Desconocido |

### Decisiones sobre los atributos
- **Nombre**: es la columna que identifica cada fila. En la celda se muestran el nombre y, en un tooltip, sus alias más conocidos.
- **Libro de primera aparición**:
  - Se compara por un **índice de orden de publicación** dentro del Cosmere, no por el año, porque hay años con varios libros.
  - En la celda se muestran el título (en el idioma activo) y el año.
  - Las novelas cortas y relatos (*Brazales de Duelo*, *El alma del emperador*, *Arcanum Ilimitado*...) tienen su propio índice y pertenecen a su saga o a "Relatos / Arcanum".
- **Granularidad de especie y poderes** (cambiado en la Fase 2, a petición): se guardan valores **concretos**, casi como en la Coppermind. Especie: pueblo o tipo ("Humano (Alezi)", "Humano (Ashyn)", "Spren (Deshecho)"), deducido de la especie, la etnia, la nación o el mundo de origen. Poderes: habilidades concretas ("Nacido de la bruma", "Astilla de Honor", "Bendición de Potencia"), con la marca "(antes)" si ya no las tiene. En la taxonomía cada valor concreto apunta a su grupo (`group`) o sistema (`system`). **Colores**: 🟩 mismos valores concretos; 🟨 comparten algún valor **o algún grupo/sistema** (Nacido de la bruma frente a Lanzamonedas → Alomancia); 🟥 nada en común. Así la columna sigue sin ser casi siempre roja.
- **Valores desconocidos**: en muchos personajes menores la especie o los poderes no se conocen. Se usa el valor explícito `Desconocido`, que solo se pone en verde contra otro `Desconocido`. `Ninguno` (se sabe que no tiene poderes) es distinto de `Desconocido`.
- **Momento de referencia** (cambiado en la Fase 2): los poderes se toman **completos, como en la Coppermind**, incluidos los que se revelan más adelante (Hemalurgia de Kelsier, Potenciación de Venli…). Se quitaron los overrides que los ocultaban. La especie sigue sin revelar identidades ocultas.

### Ejemplos de filas
Objetivo: **Vin**

| Intento | Nombre | Mundo | Primera aparición | Especie | Poderes |
|---|---|---|---|---|---|
| Kaladin | 🟥 Kaladin | 🟥 Roshar | 🟥⬇️ *El Camino de los Reyes* (2010) | 🟩 Humano | 🟥 Potenciación |
| Sazed | 🟥 Sazed | 🟩 Scadrial | 🟩 *El Imperio Final* (2006) | 🟩 Humano | 🟥 Feruquimia |
| Wax | 🟥 Wax | 🟩 Scadrial | 🟨⬇️ *Aleación de Ley* (2011) | 🟩 Humano | 🟨 Alomancia, Feruquimia |
| Vin | 🟩 Vin | 🟩 Scadrial | 🟩 *El Imperio Final* (2006) | 🟩 Humano | 🟩 Alomancia |

---

## 3. Spoilers

Al incluir personajes de todas las sagas, no se puede garantizar un personaje del día libre de spoilers para quien no haya leído todo. La estrategia es **minimizarlos y avisar**:

1. **Aviso visible** en la primera visita y en "Cómo jugar": *"El juego incluye personajes de todos los libros del Cosmere y puede contener spoilers."*
2. **Atributos poco reveladores**:
   - No hay columna de estado (vivo/muerto).
   - Las identidades ocultas se tratan con el nombre por el que se conoce al personaje en su primera aparición, con el resto de nombres como alias.
   - Los poderes revelados como giro de trama no se incluyen en la columna; como mucho van en la tarjeta final, ocultos.
3. **Tarjeta final con detalles ocultos**: la descripción y los datos sensibles van tras un botón "Mostrar detalles (puede contener spoilers)".
4. **Campo interno `spoilerNotes`** en los datos para dejar anotado por qué un valor se ha simplificado. Ayuda a mantener el criterio cuando se añadan personajes.
5. **Opcional, más adelante**: un filtro de "libros leídos" en ajustes que oculte del autocompletado a los personajes de libros no leídos. No afecta al personaje del día; solo evita spoilers al buscar.

---

## 4. Datos: fuente, esquema y curación

### 4.1 Fuente

> **Actualización (Fase 1):** la web y la API de la Coppermind están detrás de una protección anti-bots de Cloudflare, así que no se consultan directamente. Se usa el **volcado público de WikiTeam en archive.org** (`wiki-coppermind.net_w-20250225`), que contiene la última revisión de todas las páginas a fecha 25-02-2025. Los títulos en español salen de los enlaces interidioma `[[es:...]]` de cada página y, si no los hay, de las ediciones de Nova. La licencia de la Coppermind es **CC BY-NC-ND 4.0**: solo se extraen datos factuales (mundo, libro, especie, sistema de magia, nombres) y nunca se copia el texto de la wiki; el volcado se queda en `data/raw/` (fuera de git).

- **[Coppermind](https://coppermind.net)**: la wiki de referencia del Cosmere. Tiene páginas de personajes con infoboxes (mundo, especie, habilidades, libros) y categorías de personajes.
  - Usar la **API de MediaWiki** (`/w/api.php`) para listar los personajes por categoría y descargar el wikitexto de cada página. No hace falta hacer scraping del HTML.
  - Revisar la licencia de su contenido (indicada en el pie de la wiki) y **citarla en el footer**. No copiar textos largos.
  - Ser respetuoso: pausas entre peticiones, User-Agent genérico que identifique el proyecto, descarga ocasional y caché local del resultado.

### 4.2 Volumen y filtro de relevancia
- El volcado tiene ~1 800 personajes del Cosmere con ficha; la mitad citan dos capítulos o menos. Se filtran con señales de la propia wiki (`scripts/coppermind/relevance.ts`):
  - **Enlaces entrantes**: cuántos artículos de la Coppermind enlazan al personaje.
  - **Capítulos citados**: capítulos distintos referenciados en su página.
  - **Longitud** de su página.
- **Regla**: se queda quien tenga ≥ 20 enlaces entrantes, o ≥ 10 enlaces y además ≥ 10 capítulos citados o una página de ≥ 10 000 caracteres. Resultado: ~264 personajes.
- **Ajuste manual**: `"include": true` en `overrides.json` rescata a personajes memorables que la regla deja fuera (Camon, Ashe, William Ann...); `"exclude": true` quita a alguien. `data/report.md` lista los descartados más cercanos al corte.
- Con ~270 personajes, el calendario cubre unos 9 meses sin repetir.

### 4.3 Pipeline de datos
```
Coppermind API ──► scripts/fetch-coppermind.ts ──► data/raw/*.json   (caché, en .gitignore)
                                                   │
                                                   ▼
                          scripts/normalize.ts  (infobox → esquema; mapea valores a la taxonomía)
                                                   │
                                                   ▼
                  data/characters.generated.json  +  data/overrides.json  (correcciones manuales)
                                                   │
                                                   ▼
                        scripts/merge.ts ──► data/characters.json
                                                   │
                                                   ▼
                  scripts/validate.ts (Zod) ──► build del sitio
```
- **`overrides.json`** guarda las correcciones manuales por `id` (especie, poderes, alias, decisiones de spoiler). Así se puede volver a descargar de la Coppermind sin perder el trabajo manual.
- `normalize.ts` genera un **informe de huecos**: personajes con mundo, especie o libro desconocido, o con valores que no están en la taxonomía. Es la lista de trabajo de curación.
- Personajes sin primera aparición identificable o sin mundo: se excluyen hasta revisarlos.

### 4.4 Esquema (TypeScript + Zod)

```ts
// src/data/schema.ts
import { z } from "zod";

export const Character = z.object({
  id: z.string(),                       // "vin", "kaladin"
  name: z.string(),                     // nombre canónico (normalmente igual en ES y EN)
  aliases: z.array(z.string()),         // "Valette Renoux", "Kal"...
  homeworld: z.string(),                // id de taxonomía: "roshar", "scadrial", "unknown"
  firstAppearance: z.string(),          // id de libro: "mistborn-1"
  species: z.array(z.string()).min(1),  // ids de taxonomía; ["unknown"] si no se sabe
  investiture: z.array(z.string()).min(1), // ["none"] o ["unknown"] si aplica
  investitureDetail: z.array(z.string()).optional(), // "Nacido de la bruma", "Corredor del Viento"
  coppermindUrl: z.string().url(),
  i18n: z.object({                      // solo si el nombre/alias cambia en la traducción
    es: z.object({ name: z.string().optional(), aliases: z.array(z.string()).optional() }).optional(),
    en: z.object({ name: z.string().optional(), aliases: z.array(z.string()).optional() }).optional(),
  }).optional(),
  spoilerNotes: z.string().optional(),  // interno, no se muestra
});

export type Character = z.infer<typeof Character>;
```

**`data/books.json`** — cada libro con su orden de publicación y su título en ambos idiomas:
```jsonc
[
  { "id": "elantris",   "order": 1, "year": 2005, "series": "elantris",
    "title": { "en": "Elantris", "es": "Elantris" } },
  { "id": "mistborn-1", "order": 2, "year": 2006, "series": "mistborn",
    "title": { "en": "The Final Empire", "es": "El Imperio Final" } },
  { "id": "stormlight-1", "order": 7, "year": 2010, "series": "stormlight",
    "title": { "en": "The Way of Kings", "es": "El Camino de los Reyes" } }
  // ...
]
```
(Los valores de `order` son ilustrativos: hay que fijarlos con la bibliografía completa, novelas cortas incluidas, y comprobar los títulos de la edición española.)

**`data/taxonomy.json`** — los valores válidos de mundo, especie, poderes y saga, con su traducción:
```jsonc
{
  "worlds":      { "scadrial": { "en": "Scadrial", "es": "Scadrial" }, "unknown": { "en": "Unknown", "es": "Desconocido" } },
  "species":     { "human": { "en": "Human", "es": "Humano" }, "singer": { "en": "Singer", "es": "Cantor" } },
  "investiture": { "allomancy": { "en": "Allomancy", "es": "Alomancia" }, "surgebinding": { "en": "Surgebinding", "es": "Potenciación" },
                   "none": { "en": "None", "es": "Ninguno" } },
  "series":      { "mistborn": { "en": "Mistborn", "es": "Nacidos de la Bruma" } }
}
```
Los datos guardan **ids**, nunca texto traducido. La interfaz traduce al mostrar, y así el toggle de idioma cambia todo al instante.

### 4.5 Reglas de curación
- Toda columna comparable usa solo valores de la taxonomía. La validación falla si aparece uno desconocido (p. ej. una errata como "alomacia").
- Los personajes con identidades múltiples (Hoid, etc.) son **un único personaje** con alias.
- Alias únicos: dos personajes no pueden compartir alias, para que el buscador no sea ambiguo. Si hay homónimos, se desambigua en el nombre visible ("Rock (Roshar)").
- Antes del lanzamiento, pedir a un amigo lector que revise una muestra aleatoria de unos 30 personajes.

---

## 5. Arquitectura técnica

### 5.1 Principio rector: 100 % estático
Todo corre en el navegador. El personaje del día se calcula a partir de la fecha, sin servidor, lo que encaja con GitHub Pages, que solo sirve archivos estáticos.

### 5.2 Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | **Vite + React + TypeScript** | Ecosistema enorme y build estático trivial |
| Estilos | **Tailwind CSS** | Rápido de prototipar, modo oscuro sencillo |
| Estado | `useState` / `useReducer` | Suficiente para un solo modo |
| Búsqueda | **Fuse.js** | Búsqueda difusa sobre nombre y alias, tolera erratas y acentos |
| Validación de datos | **Zod** | Errores de datos detectados en el CI |
| i18n | Diccionarios JSON propios + un contexto de React (o `react-i18next`) | Solo 2 idiomas y pocas cadenas |
| Persistencia | `localStorage` | Progreso, rachas, idioma |
| Tests | **Vitest** + Testing Library | |
| Analítica (opcional) | **GoatCounter** | Gratis para proyectos no comerciales, sin cookies; funciona con cualquier hosting |
| Hosting | **GitHub Pages** | Gratis con repositorio público |
| CI / deploy | **GitHub Actions** | Lint, tests, validación de datos y despliegue en cada push a `main` |

### 5.3 Estructura de carpetas

```
cosmeredle/
├── .github/workflows/
│   └── deploy.yml             # test + build + deploy a GitHub Pages
├── data/
│   ├── raw/                   # caché de la Coppermind (ignorada en git)
│   ├── characters.json        # resultado final
│   ├── overrides.json         # correcciones manuales
│   ├── books.json
│   ├── taxonomy.json
│   └── schedule.json          # orden de personajes por día (append-only)
├── scripts/
│   ├── fetch-coppermind.ts
│   ├── normalize.ts
│   ├── merge.ts
│   ├── validate.ts
│   └── build-schedule.ts
├── public/
│   ├── favicon.svg
│   └── og-image.png           # diseño propio, para la vista previa al compartir
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── game/
│   │   ├── Game.tsx
│   │   ├── SearchBox.tsx
│   │   ├── GuessTable.tsx
│   │   ├── GuessRow.tsx
│   │   ├── VictoryCard.tsx
│   │   └── compare.ts
│   ├── components/            # Header, LanguageToggle, Countdown, ShareButton, StatsModal, HelpModal
│   ├── lib/
│   │   ├── daily.ts
│   │   ├── rng.ts
│   │   ├── storage.ts
│   │   └── share.ts
│   ├── i18n/
│   │   ├── I18nProvider.tsx
│   │   ├── es.json
│   │   └── en.json
│   └── styles/
├── tests/
├── vite.config.ts             # base: "/cosmeredle/"
├── package.json
└── README.md
```

### 5.4 Trampas
Al ser estático, los datos y el algoritmo están en el cliente: alguien con conocimientos puede sacar la respuesta. **Para un proyecto personal es aceptable**; todos los juegos de este tipo lo asumen. Como mitigación ligera, no publicar el calendario en un formato fácil de leer (guardar índices en vez de nombres en `schedule.json`).

---

## 6. Lógica del juego

### 6.1 Personaje del día

Idea: barajar la lista con una semilla fija y recorrerla según los días transcurridos desde el lanzamiento. Al terminar un ciclo se vuelve a barajar con otra semilla.

```ts
// src/lib/rng.ts
export function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

```ts
// src/lib/daily.ts
const LAUNCH = Date.UTC(2027, 0, 1);  // fecha de lanzamiento
const DAY = 86_400_000;
const TZ = "Europe/Madrid";           // hora de reinicio única para todos

export function dayIndex(now = new Date()): number {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now); // "YYYY-MM-DD"
  const [y, m, d] = ymd.split("-").map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - LAUNCH) / DAY);
}
```

**Problema**: como se añadirán personajes por lotes, un barajado sobre la lista completa cambiaría los días futuros (e incluso el de hoy) en cada actualización.
**Solución**: `scripts/build-schedule.ts` genera `schedule.json`, que es **append-only**:
- Los días pasados y el de hoy no se tocan nunca.
- Los personajes nuevos se barajan y se añaden al final de la cola pendiente.
- El script se ejecuta en el CI; si detecta que se ha modificado un día ya publicado, falla.

**Zona horaria**: una única hora de reinicio para todos. Propuesta: medianoche de **Europe/Madrid**. La alternativa es UTC, más neutral si el público es internacional.

### 6.2 Comparación de atributos

```ts
// src/game/compare.ts
export type Color = "correct" | "partial" | "wrong";
export type Arrow = "up" | "down" | null;

export const compareName = (g: string, t: string): Color =>
  g === t ? "correct" : "wrong";

export const compareSingle = (g: string, t: string): Color =>
  g === t ? "correct" : "wrong";

export function compareMulti(g: string[], t: string[]): Color {
  const G = new Set(g), T = new Set(t);
  if (G.size === T.size && [...G].every(x => T.has(x))) return "correct";
  return [...G].some(x => T.has(x)) ? "partial" : "wrong";
}

export function compareBook(g: Book, t: Book): { color: Color; arrow: Arrow } {
  if (g.id === t.id) return { color: "correct", arrow: null };
  const color = g.series === t.series ? "partial" : "wrong";
  return { color, arrow: t.order > g.order ? "up" : "down" };
}
```
- Cada columna declara su comparador en una tabla de configuración, así cambiar o añadir columnas es trivial.
- `unknown` y `none` son valores normales de la taxonomía: dos `unknown` dan verde, `unknown` contra cualquier otro da rojo.

### 6.3 Buscador
- Fuse.js sobre `name`, `aliases` y los alias traducidos, con normalización de acentos y mayúsculas.
- Con cientos de personajes: mostrar como mucho unos 8 resultados, y exigir al menos 2 letras antes de buscar.
- Mostrar junto a cada resultado el mundo, para desambiguar homónimos.
- Ocultar los personajes ya intentados.
- Accesible: `role="combobox"`, navegación con ↑ ↓ Enter.

### 6.4 Persistencia (`localStorage`)

```jsonc
{
  "version": 1,
  "settings": { "lang": "es", "theme": "dark" },
  "game": {
    "dayIndex": 312,
    "guesses": ["kaladin", "sazed", "vin"],
    "solved": true
  },
  "stats": { "played": 40, "won": 40, "currentStreak": 12, "maxStreak": 20, "totalGuesses": 410 }
}
```
- El campo `version` permite migrar el formato en el futuro.
- Envolver todo acceso en `try/catch` (modo incógnito, almacenamiento bloqueado). El juego debe funcionar igual, solo que sin recordar el progreso.

### 6.5 Compartir resultados
Texto copiado al portapapeles, o `navigator.share` en móvil. El texto se genera en el idioma activo:

```
Cosmeredle #312 — 4 intentos
🟥🟥🟥🟩🟥
🟥🟩🟩🟩🟥
🟥🟩🟨🟩🟨
🟩🟩🟩🟩🟩
https://<usuario>.github.io/cosmeredle/
```
No incluye nombres, así que no revela el personaje del día.

---

## 7. Diseño visual y UX

### Identidad visual (original, sin arte ni logos oficiales)
- **Paleta**: tonos inspirados en el Cosmere sin copiar marcas (azul tormenta, gris bruma, latón). Modo oscuro por defecto.
- **Tipografía**: Google Fonts gratuitas, p. ej. *Cinzel* para títulos e *Inter* para la interfaz.
- **Accesibilidad de color**: además del color, cada celda lleva un icono (✓, ~, ✗) para personas con daltonismo, y hay una opción de alto contraste.

### Pantallas
1. **Juego**: cabecera (logo, toggle de idioma, ayuda, estadísticas), buscador, tabla de intentos y contador de intentos.
2. **Victoria**: tarjeta del personaje (detalles ocultos tras un botón), compartir, cuenta atrás y "el personaje de ayer era…".
3. **Cómo jugar**: significado de colores y flechas, las 5 columnas, un ejemplo y el aviso de spoilers.
4. **Estadísticas**: partidas, racha actual, racha máxima y media de intentos.
5. **Acerca de**: aviso de proyecto de fans, crédito a la Coppermind y enlace al repositorio.

### Detalles
- Animación de volteo al revelar cada celda, respetando `prefers-reduced-motion`.
- Tooltip en cada celda con el valor completo (alias, habilidad concreta, título largo del libro).
- **Responsive**: con solo 5 columnas, la tabla cabe en un móvil de unos 400 px sin scroll horizontal. Celdas de ~64 px, y el título del libro abreviado en pantallas estrechas (título completo en el tooltip).

---

## 8. Idioma: toggle ES / EN

### Comportamiento
- **Toggle `ES | EN`** visible en la cabecera, en todo momento.
- Primera visita: idioma detectado con `navigator.language` (`es-*` → español; cualquier otro → inglés).
- La elección se guarda en `localStorage` y tiene prioridad en visitas siguientes.
- El cambio es **instantáneo** y no recarga la página ni pierde la partida: los intentos se guardan como ids y se vuelven a pintar en el nuevo idioma.
- Se actualiza el atributo `<html lang="...">` para accesibilidad y lectores de pantalla.

### Qué se traduce
| Elemento | Origen de la traducción |
|---|---|
| Textos de la interfaz (botones, ayuda, estadísticas) | `src/i18n/es.json` / `en.json` |
| Mundos, especies, poderes, sagas | `data/taxonomy.json` |
| Títulos de libros | `data/books.json` (título de la edición española publicada) |
| Nombres y alias de personajes | Normalmente iguales; si la traducción los cambia, `i18n` en el personaje |
| Texto de compartir | Plantilla en los diccionarios de la interfaz |

### Terminología
- Usar la de las ediciones en español: *Nacidos de la Bruma*, *El Archivo de las Tormentas*, *Esquirla*, *Investidura*, *Potenciación*, *Alomancia*, *Feruquimia*...
- El buscador acepta **alias en ambos idiomas** sea cual sea el idioma activo (quien juega en español puede escribir un apodo inglés y viceversa).
- Mantener un glosario ES↔EN dentro de `taxonomy.json` como única fuente de verdad.

### Implementación mínima
```tsx
// src/i18n/I18nProvider.tsx (esquema)
type Lang = "es" | "en";
const I18nContext = createContext<{ lang: Lang; setLang(l: Lang): void; t(key: string): string }>(null!);

// Uso:
const { t, lang, setLang } = useI18n();
<button onClick={() => setLang(lang === "es" ? "en" : "es")}>{lang === "es" ? "EN" : "ES"}</button>
```
Un test comprueba que `es.json` y `en.json` tienen exactamente las mismas claves y que toda entrada de la taxonomía y de los libros tiene `es` y `en`.

---

## 9. Hosting en GitHub Pages y costes

### Por qué GitHub Pages
- Gratis con un repositorio **público** (con la cuenta gratuita de GitHub, Pages desde un repositorio privado requiere un plan de pago).
- HTTPS automático.
- El código, los datos, el CI y el hosting están en el mismo sitio.
- Suficiente para un sitio estático pequeño. GitHub publica límites orientativos de tamaño y ancho de banda; este proyecto está muy por debajo.

### URL
- **Gratis**: `https://<usuario>.github.io/cosmeredle/` (repositorio llamado `cosmeredle`).
- Si el repositorio se llama `<usuario>.github.io`, el juego queda en la raíz: `https://<usuario>.github.io/`. Ojo: solo hay uno de estos por cuenta.
- **Dominio propio (opcional)**: se compra en cualquier registrador (unos 10 €/año por un `.com`, algo menos por un `.es`). Se configura en *Settings → Pages → Custom domain*, se añaden los registros DNS que indica GitHub y se activa "Enforce HTTPS". El alojamiento sigue siendo GitHub.

### Configuración
1. Repositorio público `cosmeredle` en GitHub.
2. `vite.config.ts`:
   ```ts
   export default defineConfig({
     plugins: [react()],
     base: "/cosmeredle/",   // "/" si se usa dominio propio o el repo <usuario>.github.io
   });
   ```
3. *Settings → Pages → Source: GitHub Actions*.
4. Workflow `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   concurrency:
     group: pages
     cancel-in-progress: true
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: npm }
         - run: npm ci
         - run: npm run validate-data   # Zod + taxonomía + schedule append-only
         - run: npm test
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with: { path: dist }
     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
5. Como es una sola página sin rutas, no hacen falta trucos de `404.html` para el enrutado.

### Costes

| Concepto | Coste |
|---|---|
| Hosting + HTTPS (GitHub Pages) | 0 € |
| CI / deploy (GitHub Actions, repo público) | 0 € |
| Analítica (GoatCounter, opcional) | 0 € |
| Fuentes (Google Fonts) | 0 € |
| Dominio propio (opcional) | ~10 €/año |
| **Total** | **0 € (o ~10 €/año con dominio)** |

---

## 10. Aspectos legales

> No es asesoramiento legal; son buenas prácticas habituales en proyectos de fans.

- **Propiedad intelectual**: el Cosmere y sus personajes pertenecen a Brandon Sanderson / Dragonsteel. Leer la política de contenido de fans de Dragonsteel (en su web oficial) antes de lanzar y seguirla.
- **Sin ánimo de lucro**: sin anuncios ni cobros.
- **Nada de arte oficial**: ni portadas, ni ilustraciones, ni logos, ni mapas, ni las tipografías oficiales.
- **Aviso en el footer (ES/EN)**:
  *"Proyecto de fans no oficial. No está afiliado ni respaldado por Brandon Sanderson ni Dragonsteel Entertainment. El Cosmere y todos sus personajes son propiedad de sus respectivos dueños."*
- **Coppermind**: atribuirla como fuente de los datos y respetar su licencia.
- **Repositorio público**: el código puede llevar licencia MIT. Para los datos derivados de la Coppermind hay que respetar la licencia de la wiki; se indica en el README.
- **Privacidad (RGPD)**: sin cuentas ni cookies de seguimiento, basta una nota breve: "Tu progreso solo se guarda en tu navegador." GoatCounter no usa cookies, así que no hace falta banner.
- **Diseño propio**: el formato de adivinar por atributos es un género con muchos juegos; usar nombre, interfaz y estética propios, sin copiar los de ningún juego concreto.

---

## 11. Testing y calidad

| Qué | Cómo |
|---|---|
| Datos | `validate.ts`: esquema Zod, ids únicos, valores dentro de la taxonomía, alias únicos entre personajes, libro de primera aparición existente en `books.json`, `coppermindUrl` presente. |
| Calendario | `schedule.json` no modifica días ya publicados; no hay repeticiones dentro de un ciclo; todos los ids existen. |
| i18n | Mismas claves en `es.json` y `en.json`; toda la taxonomía y todos los libros traducidos. |
| Lógica | Tests de `compare.ts` (incluidos `unknown` y `none` y el libro con flechas y saga) y de `daily.ts` (cambio de día a medianoche de Madrid, con horario de verano). |
| UI | Testing Library: buscar, intentar, ganar, cambiar de idioma a mitad de partida, recargar y conservar el estado. |
| Accesibilidad / rendimiento | Lighthouse ≥ 95; navegación completa con teclado. Vigilar el tamaño del JSON de personajes: con cientos de personajes debe seguir pesando poco comprimido. |
| Revisión manual | Script que lista los próximos 30 personajes del calendario para revisarlos (datos raros, spoilers evidentes). |

---

## 12. Fases y hoja de ruta

Estimación con ~5–8 h/semana.

### Fase 0 — Preparación (1 semana)
- [x] `git init`, repositorio público `cosmeredle` en GitHub, licencia MIT.
- [x] Vite + React + TS + Tailwind, Vitest. (ESLint y Prettier pendientes.)
- [x] Workflow de deploy a GitHub Pages; la URL https://dreiker52.github.io/cosmeredle/ funciona.
- [ ] Leer la política de fans de Dragonsteel y la licencia de la Coppermind.
- [x] Fijar la zona horaria de reinicio: Europe/Madrid.
- [x] Adelantado de la Fase 2: `rng.ts`, `daily.ts`, `compare.ts`, `storage.ts` con tests; toggle ES/EN.

### Fase 1 — Datos (3–4 semanas) ← *la parte más laboriosa*
- [x] `books.json` con la bibliografía completa del Cosmere (28 obras), orden de publicación y títulos ES/EN.
- [x] `taxonomy.json` (mundos, especies, poderes, sagas) con traducciones.
- [x] `scripts/coppermind/fetch-dump.ts`: la API de la Coppermind está protegida contra bots, así que se usa el volcado público de WikiTeam en archive.org (25-02-2025).
- [x] `scripts/coppermind/build.ts`: extracción + normalización + `overrides.json` + informe de huecos (`data/report.md`).
- [x] Primer lote de correcciones manuales (nombres comunes y spoilers de los personajes principales).
- [x] `validate.ts` en el CI.
- [x] Filtro de relevancia: de ~1 800 a ~270 personajes, con inclusiones manuales.
- [ ] Revisar las 13 primeras apariciones deducidas y más spoilers de poderes (ver `data/report.md`).
- [ ] Verificar las traducciones de la taxonomía marcadas como dudosas y añadir nombres en español de personajes.
- [ ] Personajes de *Islas de la Ascuaoscura* (posteriores al volcado).

### Fase 2 — Juego (2 semanas)
- [x] `rng.ts`, `daily.ts`, `build-schedule.ts` con tests. El calendario guarda ids (no índices, que cambiarían al regenerar `characters.json`); los días publicados (hasta mañana) no cambian nunca, los personajes nuevos se insertan en el ciclo en curso y el CI lo comprueba con `npm run schedule:check`.
- [x] `compare.ts` con tests.
- [x] Buscador con Fuse.js (prefijo de cualquier palabra primero, luego difuso; alias en ambos idiomas; ↑ ↓ Enter Esc).
- [x] Tabla de 5 columnas con colores, iconos ✓ ~ ✗, flechas, tooltips y animación de volteo.
- [x] Pantalla de victoria (detalles ocultos, cuenta atrás, personaje de ayer).
- [x] Persistencia en `localStorage` (partida del día y estadísticas); tests de UI con Testing Library.
- Antes del lanzamiento se juega el día 0; en desarrollo se puede forzar un día con `?day=N`.

### Fase 3 — Idioma, pulido y lanzamiento (1–2 semanas)
- [ ] `I18nProvider`, diccionarios ES/EN y toggle en la cabecera.
- [ ] Compartir resultados (en el idioma activo).
- [ ] Estadísticas, "Cómo jugar", "Acerca de", aviso de spoilers.
- [ ] Responsive, accesibilidad, modo oscuro/claro.
- [ ] Favicon e imagen OG propios.
- [ ] Beta privada con amigos lectores (1 semana) para corregir datos.
- [ ] **Lanzamiento**: compartir en comunidades de fans (r/Cosmere y grupos hispanohablantes), leyendo antes sus normas de autopromoción.

### Fase 4 — Ampliación de datos (continuo)
- [ ] Lotes de novelas cortas, relatos y personajes menores.
- [ ] Regenerar `schedule.json` (append-only) con cada lote.
- [ ] Revisar los reportes de errores de los jugadores.

**Total hasta el lanzamiento: ~7–9 semanas.**

---

## 13. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Personajes menores muy difíciles de adivinar | Medio | Filtro de relevancia (~270 personajes); intentos ilimitados; tooltips con información útil; el libro con flechas y saga orienta rápido. Si resulta frustrante, se podría añadir una pista tras N fallos (decisión futura). |
| Spoilers al incluir personajes de todas las sagas | Alto | Aviso explícito, atributos poco reveladores, detalles ocultos en la tarjeta final, sin columna de estado |
| Datos incorrectos o inconsistentes (infoboxes heterogéneos) | Alto | Informe de huecos, `overrides.json`, validación en el CI, enlace para reportar errores (issues de GitHub) |
| Añadir personajes rompe el calendario | Medio | `schedule.json` append-only, comprobado en el CI |
| Nuevos libros cambian lo que se sabe de un personaje | Medio | Valores fijados según la primera aparición; los cambios nunca afectan a días pasados |
| Traducciones incompletas | Bajo | Test de claves y de taxonomía completa en ambos idiomas |
| Reclamación por propiedad intelectual | Bajo-medio | Seguir la política de fans, sin arte ni monetización, aviso claro; retirar contenido si lo piden |
| Abandono por falta de tiempo | Medio | El sitio sigue funcionando solo mientras quede calendario; generar `schedule.json` con muchos meses de margen |
| Trampas | Bajo | Asumible en un proyecto personal |

---

## 14. Ideas futuras (fuera de alcance)

No forman parte del plan actual; se apuntan para no perderlas:
- Otros modos de juego (cita, poder, spren).
- Archivo de días pasados y modo práctica.
- Filtro de "libros leídos" en el autocompletado.
- Pista opcional tras N fallos.
- PWA instalable y jugable sin conexión.

---

## 15. Checklist de lanzamiento

- [ ] Personajes de todas las novelas principales cargados, validados y con una muestra revisada por otra persona.
- [ ] `schedule.json` con al menos 6 meses generados; los primeros 60 días revisados a mano.
- [ ] Toggle ES/EN funcionando en todas las pantallas, incluido el texto de compartir.
- [ ] Probado en Chrome, Firefox, Safari (iOS) y Android.
- [ ] Funciona con `localStorage` bloqueado.
- [ ] Cambio de día verificado a la hora configurada.
- [ ] Texto de compartir sin spoilers.
- [ ] Aviso de fans, crédito a la Coppermind, nota de privacidad y aviso de spoilers.
- [ ] Lighthouse ≥ 95.
- [ ] Desplegado en `https://<usuario>.github.io/cosmeredle/` (o dominio propio con HTTPS forzado).
- [ ] Enlace para reportar errores (issues del repositorio).
