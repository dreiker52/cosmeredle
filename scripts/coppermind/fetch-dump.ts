/**
 * Descarga el volcado de la Coppermind (WikiTeam, archive.org) y lo descomprime en data/raw/.
 * Uso: npm run data:fetch
 *
 * La Coppermind está protegida contra bots, así que no se consulta su API directamente:
 * se usa la copia pública archivada en archive.org.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import zlib from "node:zlib";

const ITEM = "wiki-coppermind.net_w-20250225";
const FILE = "coppermind.net_w-20250225-current.xml.zst";
const OUT_DIR = "data/raw/coppermind-20250225";
const OUT = `${OUT_DIR}/current.xml`;

async function main() {
  if (existsSync(OUT)) {
    console.log(`Ya existe ${OUT}; bórralo para volver a descargar.`);
    return;
  }
  const zstd = (zlib as unknown as { zstdDecompressSync?: (b: Buffer, o?: object) => Buffer }).zstdDecompressSync;
  if (!zstd) throw new Error("Esta versión de Node no soporta zstd; usa Node >= 22.15.");

  const url = `https://archive.org/download/${ITEM}/${FILE}`;
  console.log(`Descargando ${url}…`);
  const res = await fetch(url, { headers: { "User-Agent": "Cosmeredle-data-script/0.1" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar el volcado`);
  const compressed = Buffer.from(await res.arrayBuffer());

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, zstd(compressed, { maxOutputLength: 2 ** 31 - 1 }));
  console.log(`✓ Volcado guardado en ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
