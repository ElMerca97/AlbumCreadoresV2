/**
 * Verificación de integridad de datos (temporal).
 *   npx tsx __integrity_check.ts
 * Chequea: imágenes que no existen en public/, ids duplicados, playerIds sin
 * entrada en REDES, y assets de stickers sin referenciar.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { stickers } from "./src/data/stickers";
import { REDES } from "./src/data/redes";

const root = process.cwd();
let errors = 0;
const fail = (msg: string) => {
  errors++;
  console.error(`  ✗ ${msg}`);
};
const ok = (msg: string) => console.log(`  ✓ ${msg}`);

console.log("1) Imágenes referenciadas por stickers:");
let missing = 0;
for (const s of stickers) {
  if (!existsSync(join(root, "public", s.image))) {
    fail(`#${s.id} ${s.name} → falta ${s.image}`);
    missing++;
  }
}
if (!missing) ok(`las ${stickers.length} imágenes existen`);

console.log("2) Ids de sticker:");
const ids = stickers.map((s) => s.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupIds.length) fail(`ids duplicados: ${[...new Set(dupIds)].join(", ")}`);
else ok(`sin duplicados (${ids.length} cromos, rango ${Math.min(...ids)}-${Math.max(...ids)})`);

console.log("3) Claves de REDES vs playerIds:");
const playerIds = [...new Set(stickers.map((s) => s.playerId))];
const normalized = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const redesNorm = new Set(Object.keys(REDES).map(normalized));
const sinRedes = playerIds.filter((p) => !redesNorm.has(normalized(p)));
if (sinRedes.length) fail(`sin clave en REDES: ${sinRedes.join(", ")}`);
else ok(`los ${playerIds.length} playerIds tienen clave (o variante) en REDES`);
const clavesHuerfanas = Object.keys(REDES).filter((k) => !playerIds.some((p) => normalized(p) === normalized(k)));
if (clavesHuerfanas.length) fail(`claves en REDES sin sticker: ${clavesHuerfanas.join(", ")}`);
else ok("sin claves huérfanas en REDES");

console.log("4) Assets en public/images/stickers sin referenciar:");
const ref = new Set(stickers.map((s) => s.image.replace(/\\/g, "/")));
const dir = join(root, "public", "images", "stickers");
const huérfanos: string[] = [];
const walk = (d: string, prefix: string) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const rel = `${prefix}/${e.name}`;
    if (e.isDirectory()) walk(join(d, e.name), rel);
    else if (!ref.has(`images/stickers${rel}`)) huérfanos.push(`images/stickers${rel}`);
  }
};
if (existsSync(dir)) walk(dir, "");
if (huérfanos.length) console.log(`  ⚠ ${huérfanos.length} sin referenciar:\n    ${huérfanos.join("\n    ")}`);
else ok("todos referenciados");

console.log("5) Codes/leyendas:");
const leyendas = stickers.filter((s) => s.rarity === "LEGENDA");
const sinLeyenda = leyendas.map((s) => `${s.id}:${s.name}`);
ok(`leyendas: ${sinLeyenda.join(", ")}`);

console.log("6) Otras imágenes (sobres, monedas, logos):");
const otras = [
  "images/otros/SobrePlataCreadores.png",
  "images/otros/SobreDoradoCreadores.png",
  "images/otros/moneda.png",
  "images/Logos/instagram.png",
  "images/Cancha/CanchaLiffa.png",
];
let otrasFail = 0;
for (const p of otras) {
  if (!existsSync(join(root, "public", p))) {
    fail(`falta ${p}`);
    otrasFail++;
  }
}
if (!otrasFail && !errors) ok("sobres/monedas/logos OK");

if (errors) {
  console.error(`\n✗ ${errors} problema(s).`);
  process.exit(1);
}
console.log("\n✅ Integridad OK.");
