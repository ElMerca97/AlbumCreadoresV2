/**
 * Verificación temporal del sistema de códigos (se borra después de correrla).
 *   npx tsx __codes_check.ts
 */
import { CODES, COINS_POR_CODIGO, findCode, normalizeCode } from "./src/data/codes";

let errors = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    errors++;
    console.error(`  ✗ ${msg}`);
  }
};

console.log(
  `\nTotal: ${CODES.length} códigos · ${COINS_POR_CODIGO} CreaCoins c/u → ` +
    `${CODES.length * COINS_POR_CODIGO} CreaCoins en total\n`,
);

// ── 1. Ejemplos exactos que dio el usuario ──────────────────────────────
console.log("1) Ejemplos del usuario:");
for (const ex of [
  "elmerca40",
  "sangaraza10",
  "cristianbufalomendez13",
  "mazzoni",
  "chiveo",
  "5taafondo",
  "maldonadocreadores",
]) {
  ok(findCode(ex) !== undefined, ex);
}

// ── 2. Las 8 leyendas (solo nombre) ─────────────────────────────────────
console.log("2) Leyendas (solo nombre):");
for (const ex of ["mora", "corbo", "rodri", "nahu", "sangaraza", "kibu", "aaron", "manu"]) {
  ok(findCode(ex) !== undefined, ex);
}

// ── 3. Variantes tipeadas: mayúsculas, acentos, espacios, comillas ──────
console.log("3) Variantes tipeadas:");
for (const ex of [
  "ELMERCA 40",
  "Aarón 11",
  "5TA A FONDO",
  "Maldonado Creadores",
  "Cristian 'Bufalo' Mendez 13",
  "Seba 'Stithc' Sasia 7",
]) {
  const found = findCode(ex);
  ok(found !== undefined, `${JSON.stringify(ex)}${found ? ` → ${found.code}` : ""}`);
}

// ── 4. Integridad de la lista ───────────────────────────────────────────
console.log("4) Integridad:");
const codes = CODES.map((c) => c.code);
ok(new Set(codes).size === codes.length, "sin códigos duplicados");
const noCanonicos = codes.filter((c) => normalizeCode(c) !== c);
ok(
  noCanonicos.length === 0,
  noCanonicos.length
    ? `no canónicos: ${JSON.stringify(noCanonicos)} → ${JSON.stringify(noCanonicos.map((c) => normalizeCode(c)))}`
    : "todos canónicos (idempotentes)",
);
ok(CODES.every((c) => c.coins === COINS_POR_CODIGO), `todos dan ${COINS_POR_CODIGO} CreaCoins`);
ok(codes.length === 30, `cantidad esperada 30 (obtenida ${codes.length})`);

// Lista exacta esperada: 15 jugadores + 7 clubes + 8 leyendas.
const esperados = [
  // jugadores → nombre completo + número
  "morron26", "andrespetirivero3", "cundoo5", "matute6", "sebastithcsasia7",
  "manupochorodriguez8", "sangaraza10", "aaron11", "rolangas69",
  "cristianbufalomendez13", "nahuel16", "matocal369", "jona18",
  "agustinsevero99", "elmerca40",
  // clubes → solo el nombre (los 7 equipos de la liga; el escudo
  // "5ta A Fondo" está cubierto por el equipo "5TA A FONDO")
  "carolino", "chiveo", "maldonadocreadores", "mazzoni", "5taafondo",
  "sacachispas", "vikingos",
  // leyendas → solo el nombre
  "mora", "corbo", "rodri", "nahu", "sangaraza", "kibu", "aaron", "manu",
];
const setActual = new Set(codes);
const setEsperado = new Set(esperados);
const faltan = esperados.filter((c) => !setActual.has(c));
const sobran = codes.filter((c) => !setEsperado.has(c));
ok(faltan.length === 0, faltan.length ? `faltan: ${faltan.join(", ")}` : "están los 30 esperados");
ok(sobran.length === 0, sobran.length ? `sobran: ${sobran.join(", ")}` : "ningún código inesperado");

// ── 5. Códigos viejos que ya no existen ─────────────────────────────────
console.log("5) Códigos viejos eliminados:");
for (const ex of [
  "MALDONADO10", "MODODIOS", "CREADORES", "PETI3", "VINTAGE80",
  "MALDONADOCARDS", "ESCUDOCAROLINO", "ALTERNATIVA",
    "presion", // el club ahora se llama 5ta A Fondo → el código es 5taafondo
]) {
  ok(findCode(ex) === undefined, `${ex} ya no vale`);
}
// Estos dos viejos coinciden con la nueva regla → siguen válidos:
ok(findCode("SANGARAZA10") !== undefined, "sangaraza10 (coincidencia con la lista vieja)");
ok(findCode("ROLANGAS69") !== undefined, "rolangas69 (coincidencia con la lista vieja)");

// ── 6. Fuera del sistema ────────────────────────────────────────────────
console.log("6) Fuera del sistema:");
ok(findCode("canchaliffa") === undefined, "Cancha Liffa sin código");
ok(findCode("admin97") === undefined, "ADMIN97 no choca con ningún código");

console.log("\nListado completo (ordenado):");
console.log([...codes].sort().join(", "));

if (errors > 0) {
  console.error(`\n✗ ${errors} verificación(es) fallaron.`);
  process.exit(1);
}
console.log("\n✅ Todas las verificaciones pasaron.");
