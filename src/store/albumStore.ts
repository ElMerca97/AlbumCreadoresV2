import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CODES, findCode, normalizeCode } from "@/data/codes";
import { DEFAULT_FORMATION, formationById } from "@/data/formations";
import { stickers } from "@/data/stickers";

export const STORAGE_KEY = "maldonadocards";
/** Versión del esquema persistido (debe coincidir con la `version` de `persist`). */
const STORAGE_VERSION = 2;
/** Guardado del álbum anterior (app vanilla, `js/app.js`) que se migra automáticamente. */
const LEGACY_KEY = "maldonadoAlbumV2";
/**
 * Copia intacta del guardado original, tomada ANTES de migrar. Nunca se sobrescribe:
 * se conserva siempre la PRIMERA copia del progreso original, como red de seguridad.
 */
const LEGACY_BACKUP_KEY = "maldonadoAlbumV2:backup";

export type AlbumState = {
  /** ids de figuritas pegadas en el álbum */
  owned: number[];
  /** repetidas guardadas: id -> cantidad */
  extras: Record<string, number>;
  coins: number;
  packsOpened: number;
  /** puesto (p0, p1, …) -> id de figurita en "Mi Equipo" */
  lineup: Record<string, number | null>;
  /** formación elegida (ver src/data/formations.ts) */
  lineupFormat: string;
  /** códigos de canje ya usados */
  redeemed: string[];
};

export type RedeemResult = {
  ok: boolean;
  message: string;
  coins?: number;
};

export type AlbumActions = {
  addCoins: (n: number) => void;
  /** Canjea un código: suma CreaCoins. */
  redeem: (raw: string) => RedeemResult;
  /** Suma figuritas al álbum. Devuelve las nuevas pegadas; gained queda en 0 (sin recompensa inmediata). */
  addStickers: (ids: number[]) => { fresh: number[]; gained: number };
  /** Vende una repetida. Devuelve las monedas ganadas. */
  sellExtra: (id: number) => number;
  /** Vende todas las repetidas. Devuelve el total. */
  sellAllExtras: () => number;
  registerPacks: (n?: number) => void;
  setSlot: (slot: string, id: number | null) => void;
  /** Asigna un jugador a un puesto (si ya estaba en otro, lo libera). */
  assignSlot: (slot: string, id: number | null) => void;
  setLineupFormat: (id: string) => void;
  reset: () => void;
};

export const initialState: AlbumState = {
  owned: [],
  extras: {},
  coins: 900,
  packsOpened: 0,
  lineup: {},
  lineupFormat: DEFAULT_FORMATION,
  redeemed: [],
};

/**
 * Valor ESTIMADO de una repetida para las estadísticas del álbum.
 * La venta real (`sellExtra` / `sellAllExtras`) paga entre 5 y 15 CreaCoins
 * al azar sin importar la rareza, así que usamos el punto medio (10).
 */
export const valueOf = (_id: number) => 10;

/**
 * Depura la lista de códigos canjeados: la normaliza (minúsculas, sin acentos
 * ni espacios) y descarta los que ya no existen en `CODES` — el set de códigos
 * cambió con el tiempo y los guardados viejos traen otro formato.
 */
function sanitizeRedeemed(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  const valid = new Set(CODES.map((c) => c.code));
  const out = new Set<string>();
  for (const entry of list) {
    if (typeof entry !== "string") continue;
    const code = normalizeCode(entry);
    if (valid.has(code)) out.add(code);
  }
  return [...out];
}

/**
 * Migra el guardado del álbum anterior (app vanilla, clave `maldonadoAlbumV2`) al
 * esquema de zustand.
 *
 * Los ids del álbum anterior coinciden con los de este álbum, así que `collectedIds`
 * se copia tal cual a `owned`. El álbum anterior no tenía repetidas, ni formaciones,
 * ni lineup por puestos: esas partes quedan en su valor inicial.
 *
 * Antes de transformar nada, guarda una copia exacta del JSON original en
 * `maldonadoAlbumV2:backup` (sólo si esa copia todavía no existe).
 */
function migrateLegacy() {
  try {
    if (typeof localStorage === "undefined") return;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy || localStorage.getItem(STORAGE_KEY)) return;

    // Respaldo de seguridad: copia exacta del JSON original, ANTES de escribir el nuevo
    // formato. Sólo se crea si no existe, para conservar siempre la primera copia.
    if (!localStorage.getItem(LEGACY_BACKUP_KEY)) {
      localStorage.setItem(LEGACY_BACKUP_KEY, legacy);
    }

    const old = JSON.parse(legacy) as {
      collectedIds?: unknown;
      coins?: unknown;
      openedPacks?: unknown;
      redeemedCodes?: unknown;
    };

    // El álbum anterior usaba otro set de códigos: normalizamos y sólo
    // conservamos los que existen acá (ver sanitizeRedeemed).
    const state: AlbumState = {
      ...initialState,
      owned: Array.isArray(old.collectedIds)
        ? old.collectedIds.filter((id): id is number => typeof id === "number")
        : [],
      coins: typeof old.coins === "number" ? old.coins : initialState.coins,
      packsOpened: typeof old.openedPacks === "number" ? old.openedPacks : 0,
      redeemed: sanitizeRedeemed(old.redeemedCodes),
    };

    // Se guarda con la versión ACTUAL: si se guardara con una anterior, el `migrate` de
    // persist vería `version < 2` y vaciaría la colección recién migrada.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: STORAGE_VERSION }));
    // OJO: `LEGACY_KEY` no se borra a propósito: se conserva como respaldo del progreso
    // original junto a `LEGACY_BACKUP_KEY`. La migración no se repite porque la guarda de
    // arriba corta cuando `STORAGE_KEY` ya existe.
  } catch {
    /* ignore */
  }
}
migrateLegacy();

/**
 * Pasa el formato viejo de claves (por, d1.., m1.., f1..) al nuevo (p0, p1, …).
 *
 * Debe declararse ANTES de `create(...)`: `merge` lo usa durante la hidratación inicial,
 * que se ejecuta de forma sincrónica al crear el store. Declarado después, en ese momento
 * todavía no está inicializado y la hidratación falla en silencio (se pierde el progreso).
 */
const LEGACY_SLOT_ORDER = ["por", "d1", "d2", "d3", "d4", "m1", "m2", "m3", "f1", "f2", "f3"];

export const useAlbumStore = create<AlbumState & AlbumActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addCoins: (n) => set((s) => ({ coins: Math.max(0, s.coins + n) })),

      redeem: (raw) => {
        const code = normalizeCode(raw);
        if (!code) return { ok: false, message: "Escribí un código para canjear." };
        if (get().redeemed.includes(code))
          return { ok: false, message: "Ese código ya fue canjeado en este navegador." };

        const found = findCode(raw);
        if (!found)
          return {
            ok: false,
            message: "Código inválido: revisá el nombre del jugador y su número.",
          };

        set((s) => ({
          coins: s.coins + found.coins,
          redeemed: [...s.redeemed, code],
        }));

        return {
          ok: true,
          message: `¡Código canjeado! +${found.coins} CreaCoins`,
          coins: found.coins,
        };
      },

      addStickers: (ids) => {
        const { owned, extras } = get();
        const ownedSet = new Set(owned);
        const nextExtras = { ...extras };
        const fresh: number[] = [];
        // Las repetidas solo se guardan; no acreditan monedas al salir del sobre.
        const gained = 0;
        for (const id of ids) {
          if (ownedSet.has(id)) {
            nextExtras[id] = (nextExtras[id] ?? 0) + 1;
          } else {
            ownedSet.add(id);
            fresh.push(id);
          }
        }
        set({ owned: [...ownedSet], extras: nextExtras });
        return { fresh, gained };
      },

      sellExtra: (id) => {
        const { extras } = get();
        const count = extras[id] ?? 0;
        if (count <= 0) return 0;
        // Recompensa aleatoria por venta: 5-15 CreaCoins, sin importar la rareza.
        const reward = Math.floor(Math.random() * 11) + 5;
        const next = { ...extras };
        if (count <= 1) delete next[id];
        else next[id] = count - 1;
        set((s) => ({ extras: next, coins: s.coins + reward }));
        return reward;
      },

      sellAllExtras: () => {
        const entries = Object.entries(get().extras);
        if (entries.length === 0) return 0;
        // Cada repetida genera su propia recompensa aleatoria de 5-15 CreaCoins.
        let total = 0;
        for (const [, count] of entries) {
          for (let i = 0; i < count; i++) total += Math.floor(Math.random() * 11) + 5;
        }
        set((s) => ({ extras: {}, coins: s.coins + total }));
        return total;
      },

      registerPacks: (n = 1) => set((s) => ({ packsOpened: s.packsOpened + n })),

      setSlot: (slot, id) => set((s) => ({ lineup: { ...s.lineup, [slot]: id } })),

      assignSlot: (slot, id) =>
        set((s) => {
          const lineup = { ...s.lineup };
          if (id !== null) {
            const playerId = stickers.find((sticker) => sticker.id === id)?.playerId;
            // Un jugador no puede ocupar dos puestos, aunque se elija otra versión.
            for (const k of Object.keys(lineup)) {
              const assignedPlayer = stickers.find((sticker) => sticker.id === lineup[k])?.playerId;
              if (lineup[k] === id || (playerId && assignedPlayer === playerId)) lineup[k] = null;
            }
          }
          lineup[slot] = id;
          return { lineup };
        }),

      setLineupFormat: (id) => {
        const formation = formationById(id);
        set((s) => {
          const lineup = { ...s.lineup };
          // Al cambiar de formación, libera los puestos cuyo cromo ya no encaja
          // (posición incompatible con el slot, escudo/leyenda sin posición, o
          // cromo eliminado del álbum): si no, quedaría una alineación inválida
          // que solo se avisa recién al querer jugar un amistoso.
          for (const slot of formation.slots) {
            const stickerId = lineup[slot.key];
            if (stickerId == null) continue;
            const st = stickers.find((x) => x.id === stickerId);
            if (!st || !st.pos || !slot.accepts.includes(st.pos)) lineup[slot.key] = null;
          }
          return { lineupFormat: formation.id, lineup };
        });
      },

      reset: () =>
        set({ ...initialState, owned: [], extras: {}, lineup: {}, redeemed: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // La versión anterior entregaba cromos de muestra. Al actualizar,
      // limpiamos únicamente la colección para que los cromos se obtengan en sobres.
      migrate: (persisted, version) => {
        if (version < 2 && persisted && typeof persisted === "object") {
          return { ...persisted, owned: [], extras: {}, lineup: {} };
        }
        return persisted;
      },
      // solo se persisten los datos, no las acciones
      partialize: (s) => ({
        owned: s.owned,
        extras: s.extras,
        coins: s.coins,
        packsOpened: s.packsOpened,
        lineup: s.lineup,
        lineupFormat: s.lineupFormat,
        redeemed: s.redeemed,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AlbumState>;
        return {
          ...current,
          owned: Array.isArray(p.owned) ? p.owned : current.owned,
          extras: p.extras && typeof p.extras === "object" ? p.extras : current.extras,
          coins: typeof p.coins === "number" ? p.coins : current.coins,
          packsOpened: typeof p.packsOpened === "number" ? p.packsOpened : current.packsOpened,
          lineup: migrateLineup(p.lineup, current.lineup),
          lineupFormat:
            typeof p.lineupFormat === "string" ? p.lineupFormat : current.lineupFormat,
          redeemed: Array.isArray(p.redeemed) ? sanitizeRedeemed(p.redeemed) : current.redeemed,
        };
      },
    },
  ),
);

function migrateLineup(
  persisted: unknown,
  current: Record<string, number | null>,
): Record<string, number | null> {
  if (!persisted || typeof persisted !== "object") return current;
  const raw = persisted as Record<string, number | null>;
  const alreadyNew = Object.keys(raw).some((k) => /^p\d+$/.test(k));
  if (alreadyNew) return raw;
  const next: Record<string, number | null> = {};
  LEGACY_SLOT_ORDER.forEach((key, i) => {
    if (raw[key]) next[`p${i}`] = raw[key];
  });
  return Object.keys(next).length ? next : current;
}

// ── Selectores / hooks derivados ─────────────────────────────────────

/** Set de ids pegadas (memoizado; no se puede persistir un Set directamente). */
export function useOwnedSet() {
  const owned = useAlbumStore((s) => s.owned);
  return useMemo(() => new Set(owned), [owned]);
}

export function useAlbumStats() {
  const owned = useAlbumStore((s) => s.owned);
  const extras = useAlbumStore((s) => s.extras);
  return useMemo(() => {
    const ownedSet = new Set(owned);
    const total = stickers.length;
    const got = stickers.filter((s) => ownedSet.has(s.id)).length;
    const dupes = Object.values(extras).reduce((a, b) => a + b, 0);
    const dupesValue = Object.entries(extras).reduce(
      (sum, [id, count]) => sum + valueOf(Number(id)) * count,
      0,
    );
    return {
      total,
      got,
      missing: total - got,
      dupes,
      dupesValue,
      pct: Math.round((got / total) * 100),
    };
  }, [owned, extras]);
}
