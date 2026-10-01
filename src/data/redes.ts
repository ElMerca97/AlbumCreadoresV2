/**
 * ════════════════════════════ //redes// ════════════════════════════
 * REDES SOCIALES de cada entidad del álbum.
 *
 * ▶ CÓMO SE USA
 *   Al abrir un cromo, debajo de la carta se muestran las redes cargadas acá.
 *   Por ahora solo Instagram. Cuando se agregue otra red, se sumará al tipo
 *   `Redes` de abajo y a los íconos del CardModal (bloque //redes//).
 *   Los íconos ya están en `public/images/Logos/` (facebook.png, tiktok.png,
 *   youtube.png, instagram.png).
 *
 * ▶ CÓMO CARGAR UNA URL (por cada jugador, club, cancha o leyenda)
 *   - Link completo:   "https://www.instagram.com/usuario"
 *   - Solo el usuario: "usuario" o "@usuario"  → se arma el link solo.
 *   Si el campo queda vacío ("") o no existe la clave, el cromo NO muestra
 *   ninguna red, así nunca se ven íconos rotos.
 *
 * ▶ LA CLAVE es el `playerId` del cromo (el mismo de src/data/stickers.ts).
 *   Ej: el cromo de "Manu 'Pocho' Rodriguez" se carga en "Manu Rodriguez".
 *   No hace falta calzar mayúsculas ni acentos: "5ta A Fondo", "5ta a Fondo"
 *   o "5taafondo" apuntan a la misma entrada.
 *   Ojo: "Sangaraza" y "Aarón" son jugador Y leyenda a la vez (comparten
 *   playerId), así que una sola entrada cubre todos sus cromos. En cambio
 *   "Manu Rodriguez" (jugador) y "Manu" (leyenda) son claves distintas:
 *   cargá la URL en ambas si es la misma persona.
 *
 * ▶ ENTIDADES NUEVAS: copiá una línea y usá el playerId del sticker.
 * ═══════════════════════════════════════════════════════════════════
 */

import { normalizeCode } from "@/data/codes";

export type Redes = {
  /** Instagram (por ahora la única red del sistema). URL o solo el usuario. */
  instagram?: string;
  // Acá se suman las próximas redes: tiktok?: string; facebook?: string; …
};

/** Redes por entidad. Clave = `playerId` del sticker. */
export const REDES: Record<string, Redes> = {
  // ─────────────────────────── //redes// JUGADORES ───────────────────────────
  "Aarón": { instagram: "https://www.instagram.com/aar_n11/" },
  "Agus": { instagram: "https://www.instagram.com/agus18severo/" },
  "Andres": { instagram: "https://www.instagram.com/riveroandres8/" },
  "Cristian": { instagram: "https://www.instagram.com/cristianmndz.b/" },
  "Cundoo": { instagram: "https://www.instagram.com/cund00/" },
  "ElMerca": { instagram: "https://www.instagram.com/guillemercadal/" },
  "Jona": { instagram: "https://www.instagram.com/_jonaabd/" },
  "Manu Rodriguez": { instagram: "https://www.instagram.com/pochoorodriguez/" },
  "Mato": { instagram: "https://www.instagram.com/matocal369/" },
  "Matute": { instagram: "https://www.instagram.com/maaaatuuuuteeee/" },
  "Morron": { instagram: "https://www.instagram.com/morron_2000/" },
  "Nahuel": { instagram: "https://www.instagram.com/soynahuelsan/" },
  "Rolangas": { instagram: "https://www.instagram.com/rolangasss69/" },
  "Sangaraza": {instagram: "https://www.instagram.com/saangaraza/" },
  "Seba": { instagram: "https://www.instagram.com/el_mas_feo_de_tik_tok/" },

  // ─────────────────────────── //redes// CLUBES ───────────────────────────
  "FC Carolino": { instagram: "" },
  "Chiveo": { instagram: "https://www.instagram.com/f.c_chiveo/" },
  "SeleccionMaldonadoCreadores": { instagram: "https://www.instagram.com/maldonadocreadores/" },
  "Mazzoni": { instagram: "https://www.instagram.com/mazzonifc/" },
  "Sacachispas": { instagram: "https://www.instagram.com/_sacachispas2024_/" },
  "Vikingos": { instagram: "https://www.instagram.com/vikingo.futbolclub/" },
  "5ta a Fondo": { instagram: "https://www.instagram.com/5tafondo2026/" },

  // ─────────────────────────── //redes// CANCHA ───────────────────────────
  "CanchaLiffa": { instagram: "https://www.instagram.com/liffacantina/" },

  // ─────────────────────────── //redes// LEYENDAS ───────────────────────────
  "Mora": { instagram: "https://www.instagram.com/mora.uyy/" },
  "Corbo": { instagram: "https://www.instagram.com/lucascorboo/" },
  "Rodri": { instagram: "https://www.instagram.com/_rodrii78_/" },
  "Nahu": { instagram: "https://www.instagram.com/nahulopezzzz/" },
  "Kibu": { instagram: "https://www.instagram.com/ggonzaviiera/" },
  "Manu": { instagram: "https://www.instagram.com/pochoorodriguez/" },
  // "Sangaraza" y "Aarón": ya están arriba en JUGADORES (mismo playerId).
};

/** Índice normalizado → redes: las claves no dependen de mayúsculas ni acentos. */
const REDES_NORM = new Map(Object.entries(REDES).map(([id, r]) => [normalizeCode(id), r]));

/**
 * Link final de Instagram para un cromo, o `null` si no hay nada cargado.
 * Acepta URL completa o solo el usuario ("@usuario"). La clave se compara
 * normalizada (minúsculas, sin acentos ni espacios), igual que los códigos.
 */
export function instagramUrl(playerId: string): string | null {
  const raw = REDES_NORM.get(normalizeCode(playerId))?.instagram?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const user = raw.replace(/^@+/, "").replace(/\/+$/, "");
  if (!user) return null;
  return `https://www.instagram.com/${user}/`;
}
