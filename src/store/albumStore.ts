import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CODES, findCode } from "@/data/codes";
import { DEFAULT_FORMATION, formationById } from "@/data/formations";
import { stickers } from "@/data/stickers";
import { SELL_VALUE } from "@/lib/rarity";

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
  gifts?: string[];
};

export type AlbumActions = {
  addCoins: (n: number) => void;
  /** Canjea un código: suma monedas y/o figuritas de regalo. */
  redeem: (raw: string) => RedeemResult;
  /** Suma figuritas al álbum. Devuelve las nuevas y el valor de las repetidas. */
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

export const valueOf = (id: number) => {
  const st = stickers.find((x) => x.id === id);
  return st ? SELL_VALUE[st.rarity] : 20;
};

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

    // El álbum anterior usaba otro set de códigos: sólo conservamos los que existen acá.
    const validCodes = new Set(CODES.map((c) => c.code));

    const state: AlbumState = {
      ...initialState,
      owned: Array.isArray(old.collectedIds)
        ? old.collectedIds.filter((id): id is number => typeof id === "number")
        : [],
      coins: typeof old.coins === "number" ? old.coins : initialState.coins,
      packsOpened: typeof old.openedPacks === "number" ? old.openedPacks : 0,
      redeemed: Array.isArray(old.redeemedCodes)
        ? old.redeemedCodes.filter((c): c is string => typeof c === "string" && validCodes.has(c))
        : [],
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
        const code = raw.trim().toUpperCase().replace(/\s+/g, "");
        if (!code) return { ok: false, message: "Escribí un código para canjear." };
        if (get().redeemed.includes(code))
          return { ok: false, message: "Ese código ya fue canjeado en este navegador." };

        const found = findCode(raw);
        if (!found) return { ok: false, message: "Código inválido. Revisá las pistas." };

        const giftNames: string[] = [];
        if (found.gifts?.length) {
          for (const id of found.gifts) {
            const st = stickers.find((x) => x.id === id);
            if (st) giftNames.push(`${st.name} (${st.version.replace("VERSION ", "")})`);
          }
          get().addStickers(found.gifts);
        }

        set((s) => ({
          coins: s.coins + found.coins,
          redeemed: [...s.redeemed, code],
        }));

        const parts = [`+${found.coins} 🪙`];
        if (giftNames.length) parts.push(`regalo: ${giftNames.join(", ")}`);
        return { ok: true, message: `¡Código canjeado! ${parts.join(" · ")}`, coins: found.coins };
      },

      addStickers: (ids) => {
        const { owned, extras } = get();
        const ownedSet = new Set(owned);
        const nextExtras = { ...extras };
        const fresh: number[] = [];
        let gained = 0;
        for (const id of ids) {
          if (ownedSet.has(id)) {
            nextExtras[id] = (nextExtras[id] ?? 0) + 1;
            gained += valueOf(id);
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
        const value = valueOf(id);
        const next = { ...extras };
        if (count <= 1) delete next[id];
        else next[id] = count - 1;
        set((s) => ({ extras: next, coins: s.coins + value }));
        return value;
      },

      sellAllExtras: () => {
        const entries = Object.entries(get().extras);
        if (entries.length === 0) return 0;
        let total = 0;
        for (const [id, count] of entries) total += valueOf(Number(id)) * count;
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

      setLineupFormat: (id) => set({ lineupFormat: formationById(id).id }),

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
          redeemed: Array.isArray(p.redeemed) ? p.redeemed : current.redeemed,
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
