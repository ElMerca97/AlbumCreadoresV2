import { DEFAULT_TEAMS } from "@/data/league";
import { stickers } from "@/data/stickers";

export type CodeDef = {
  code: string;
  coins: number;
};

/** CreaCoins que otorga cada código canjeado. */
export const COINS_POR_CODIGO = 700;

/**
 * Código administrativo especial: NO está en `CODES` (no se puede canjear,
 * no consume cupo ni entra en `redeemed`). Abre el panel admin del CodeModal
 * y desbloquea el modo admin de la Liga (LeagueView).
 */
export const ADMIN_CODE = "ADMIN97";

/** Minúsculas sin acentos, pero SIN borrar espacios ni símbolos. */
const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/**
 * Normaliza un código de canje para compararlo sin importar mayúsculas,
 * acentos, espacios ni símbolos: "Aarón 11" → "aaron11",
 * "5TA A FONDO" → "5taafondo". Se usa tanto para construir los códigos como
 * para validar lo que tipea el usuario, así que cualquier variante funciona.
 */
export function normalizeCode(raw: string): string {
  return fold(raw).replace(/[^a-z0-9]/g, "");
}

/** Código de un jugador: nombre completo (nombre + apodo + apellido) + número. */
const codeOf = (name: string, number?: number): string =>
  `${normalizeCode(name)}${number ?? ""}`;

/**
 * Códigos del álbum, generados de los datos (no hay lista escrita a mano):
 *
 * - Jugadores: nombre + número de camiseta → `elmerca40`, `cristianbufalomendez13`.
 * - Clubes: solo el nombre → `mazzoni`, `5taafondo`, `maldonadocreadores`.
 * - Leyendas: solo el nombre → `mora`, `kibu`.
 */
function buildCodes(): CodeDef[] {
  const byCode = new Map<string, CodeDef>();
  const add = (code: string) => {
    if (code && !byCode.has(code)) byCode.set(code, { code, coins: COINS_POR_CODIGO });
  };

  // Jugadores: UN código por jugador; si repetía versiones, manda la primera
  // del álbum. OJO: Mato Cal figura con el 17 en ÉPICO y con el 369 en el resto:
  // prevalece 369 (es el que trae la versión COMÚN).
  const jugadores = new Map<string, { name: string; number?: number }>();
  for (const s of stickers) {
    if (s.type === "club" || s.type === "court" || s.rarity === "LEYENDA") continue;
    if (jugadores.has(s.playerId)) continue;
    jugadores.set(s.playerId, { name: s.name, number: s.number });
  }
  for (const j of jugadores.values()) add(codeOf(j.name, j.number));

  // Clubes: los equipos de la liga (Mazzoni, Chiveo, 5TA A FONDO, Maldonado
  // Creadores…) + los escudos del álbum cuyo club NO tiene equipo en la liga
  // (hoy: ninguno — el escudo "5ta A Fondo" queda cubierto por el equipo de la
  // liga "5TA A FONDO"). Un escudo está "cubierto" cuando los tokens del
  // nombre del equipo aparecen dentro del suyo: "carolino" ⊂ "fccarolino".
  // Se tokeniza ANTES de slugificar: normalizeCode() borra los espacios y
  // "Maldonado Creadores" quedaría como un solo token que no matchea el escudo.
  const tokens = (s: string) => fold(s).match(/[a-z0-9]+/g) ?? [];
  for (const t of DEFAULT_TEAMS) add(normalizeCode(t.name));
  for (const s of stickers) {
    if (s.type !== "club") continue;
    const slug = normalizeCode(s.name);
    const tieneEquipo = DEFAULT_TEAMS.some((t) =>
      tokens(t.name).every((tok) => slug.includes(tok)),
    );
    if (!tieneEquipo) add(slug);
  }

  // Leyendas: solo el nombre (son decorativas y no llevan número).
  for (const s of stickers) {
    if (s.rarity === "LEYENDA") add(normalizeCode(s.name));
  }

  return [...byCode.values()];
}

/** Códigos de canje disponibles (generados desde los datos del álbum). */
export const CODES: CodeDef[] = buildCodes();

/** Busca un código de canje normalizado (minúsculas, sin acentos ni espacios). */
export function findCode(raw: string): CodeDef | undefined {
  const code = normalizeCode(raw);
  return CODES.find((c) => c.code === code);
}
