import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_FIXTURES,
  DEFAULT_TEAMS,
  recalcFromFixtures,
  type Fixture,
  type TeamRow,
} from "@/data/league";

export type LeagueState = {
  teams: TeamRow[];
  fixtures: Fixture[];
  admin: boolean;
  setAdmin: (v: boolean) => void;
  updateTeam: (id: string, patch: Partial<TeamRow>) => void;
  addTeam: (name: string) => void;
  removeTeam: (id: string) => void;
  updateFixture: (id: string, patch: Partial<Fixture>) => void;
  addFixture: (f: Omit<Fixture, "id">) => void;
  removeFixture: (id: string) => void;
  resetLeague: () => void;
  /** Deja el Fixture en 0-0: borra goles de todos los partidos y la tabla queda en 0. */
  resetFixture: () => void;
};

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useLeagueStore = create<LeagueState>()(
  persist(
    (set) => ({
      teams: DEFAULT_TEAMS,
      fixtures: DEFAULT_FIXTURES,
      admin: false,

      setAdmin: (v) => set({ admin: v }),

      updateTeam: (id, patch) =>
        set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      addTeam: (name) => {
        const row: TeamRow = {
          id: uid(),
          name,
          short: name.slice(0, 12).toUpperCase(),
          pj: 0,
          pg: 0,
          pe: 0,
          pp: 0,
          gf: 0,
          gc: 0,
        };
        set((s) => ({ teams: [...s.teams, row] }));
      },

      removeTeam: (id) =>
        set((s) => ({
          teams: s.teams.filter((t) => t.id !== id),
          fixtures: s.fixtures.filter((f) => f.home !== id && f.away !== id),
        })),

      updateFixture: (id, patch) =>
        set((s) => {
          const fixtures = s.fixtures.map((f) => (f.id === id ? { ...f, ...patch } : f));
          return { fixtures, teams: recalcFromFixtures(s.teams, fixtures) };
        }),

      addFixture: (f) =>
        set((s) => ({
          fixtures: [...s.fixtures, { ...f, id: uid() }].sort((a, b) => a.date.localeCompare(b.date)),
        })),

      removeFixture: (id) =>
        set((s) => {
          const fixtures = s.fixtures.filter((f) => f.id !== id);
          return { fixtures, teams: recalcFromFixtures(s.teams, fixtures) };
        }),

      resetLeague: () =>
        set({ teams: DEFAULT_TEAMS.map((t) => ({ ...t })), fixtures: DEFAULT_FIXTURES.map((f) => ({ ...f })) }),

      /** Fixture 0-0: quita goles de todos los partidos y recalcula la tabla a 0. */
      resetFixture: () =>
        set((s) => {
          const fixtures = s.fixtures.map((f) => ({ ...f, homeGoals: undefined, awayGoals: undefined }));
          return { fixtures, teams: recalcFromFixtures(s.teams, fixtures) };
        }),
    }),
    {
      name: "maldonadocards:liga",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      // Limpia SOLO los datos de la liga persistidos (goles y estadísticas de la
      // tabla). No toca álbum, monedas, cromos, códigos, Mi Equipo ni amistosos:
      // esos viven en otras claves de localStorage.
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        const p = persisted as {
          teams?: unknown;
          fixtures?: unknown;
          admin?: unknown;
        };
        // ── Serie 1 oficial: fuerza equipos, fixture y tabla desde cero. ─────────
        // Reemplaza cualquier dato persistido anterior (ej. "Presión", "5TA A FONDO"
        // como equipo separado, resultados viejos, fechas viejas) por la nueva Serie 1.
        const cleanTeams = DEFAULT_TEAMS.map((t) => ({ ...t, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0 }));
        const cleanFixtures = DEFAULT_FIXTURES.map((f) => ({ ...f }));
        return {
          ...persisted,
          teams: recalcFromFixtures(cleanTeams, cleanFixtures), // tabla real con Fecha 1 jugada
          fixtures: cleanFixtures,
          admin: typeof p.admin === "boolean" ? p.admin : false,
        };
      },
      partialize: (s) => ({ teams: s.teams, fixtures: s.fixtures, admin: s.admin }),
    },
  ),
);
