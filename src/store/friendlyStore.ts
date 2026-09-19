import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const FRIENDLY_STORAGE_KEY = "maldonadocards:amistosos";

/** Máximo de amistosos por ventana. */
export const FRIENDLY_LIMIT = 3;
/** Ventana del límite, en milisegundos (5 horas). */
export const FRIENDLY_WINDOW_MS = 5 * 60 * 60 * 1000;

type FriendlyState = {
  /** timestamps (ms) de inicio de cada amistoso jugado. */
  friendliesPlayed: number[];
  /** Estadísticas acumuladas por playerId (Etapa 3). */
  playerStats: Record<string, PlayerStats>;
  /** Elimina los timestamps que quedaron fuera de la ventana de 5 horas. */
  prune: () => void;
  /** Registra el inicio de un amistoso (devuelve false si no hay cupo). */
  registerFriendly: () => boolean;
  /** Panel admin: deja friendliesPlayed en [] (3/3 disponibles de nuevo). */
  resetFriendlies: () => void;
  /**
   * Etapa 3: acumula las estadísticas de un partido finalizado.
   * Se llama UNA sola vez por partido (desde finishMatch).
   */
  recordMatchStats: (
    performances: { playerId: string; name: string; pos: string; goals: number; assists: number; points: number }[],
  ) => void;
};

export type PlayerStats = {
  playerId: string;
  name: string;
  pos: string;
  appearances: number;
  goals: number;
  assists: number;
  points: number;
};

export const friendliesInWindow = (played: number[], now = Date.now()) =>
  played.filter((t) => now - t < FRIENDLY_WINDOW_MS);

export const useFriendlyStore = create<FriendlyState>()(
  persist(
    (set, get) => ({
      friendliesPlayed: [],
      playerStats: {},

      prune: () =>
        set((s) => ({ friendliesPlayed: friendliesInWindow(s.friendliesPlayed) })),

      registerFriendly: () => {
        const recent = friendliesInWindow(get().friendliesPlayed);
        if (recent.length >= FRIENDLY_LIMIT) return false;
        set({ friendliesPlayed: [...recent, Date.now()] });
        return true;
      },

      /** Panel admin: restablece el límite de amistosos (3/3). No toca stats ni monedas. */
      resetFriendlies: () => set({ friendliesPlayed: [] }),

      /** Etapa 3: acumula estadísticas del partido (se llama una sola vez). */
      recordMatchStats: (performances) => {
        set((s) => {
          const next = { ...s.playerStats };
          for (const perf of performances) {
            // Sólo jugadores de Mi Equipo (los rivales no se acumulan).
            const prev = next[perf.playerId];
            next[perf.playerId] = {
              playerId: perf.playerId,
              name: perf.name,
              pos: perf.pos,
              appearances: (prev?.appearances ?? 0) + 1,
              goals: (prev?.goals ?? 0) + perf.goals,
              assists: (prev?.assists ?? 0) + perf.assists,
              points: (prev?.points ?? 0) + perf.points,
            };
          }
          return { playerStats: next };
        });
      },
    }),
    {
      name: FRIENDLY_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        friendliesPlayed: s.friendliesPlayed,
        playerStats: s.playerStats,
      }),
    },
  ),
);

/** Amistosos que todavía se pueden jugar en esta ventana. */
export function friendliesAvailable(played: number[], now = Date.now()) {
  return Math.max(0, FRIENDLY_LIMIT - friendliesInWindow(played, now).length);
}

/** Indica si todavía queda cupo en la ventana actual. */
export function canPlayFriendly(played: number[], now = Date.now()) {
  return friendliesAvailable(played, now) > 0;
}

/** Ms restantes hasta recuperar el próximo cupo (0 si ya hay cupo). */
export function msUntilNextFriendly(played: number[], now = Date.now()) {
  const recent = friendliesInWindow(played, now).sort((a, b) => a - b);
  if (recent.length < FRIENDLY_LIMIT) return 0;
  const oldest = recent[0] ?? now;
  return Math.max(0, oldest + FRIENDLY_WINDOW_MS - now);
}

/** Formatea un tiempo restante en "Xh Ym". */
export function formatMs(ms: number) {
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
