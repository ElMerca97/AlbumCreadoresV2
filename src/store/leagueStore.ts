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
    }),
    {
      name: "maldonadocards:liga",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ teams: s.teams, fixtures: s.fixtures, admin: s.admin }),
    },
  ),
);
