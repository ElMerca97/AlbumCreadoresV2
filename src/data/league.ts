export type TeamRow = {
  id: string;
  name: string;
  short: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
};

export type Fixture = {
  id: string;
  home: string;
  away: string;
  /** YYYY-MM-DD */
  date: string;
  homeGoals?: number;
  awayGoals?: number;
  note?: string;
  courtId?: string;
};

export const LEAGUE_NAME = "Liga de Creadores · Apertura 2026";

export function computeStandings(teams: TeamRow[]) {
  return teams
    .map((t) => {
      const pts = t.pg * 3 + t.pe;
      const dg = t.gf - t.gc;
      return { ...t, pts, dg };
    })
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name.localeCompare(b.name);
    });
}

export function recalcFromFixtures(teams: TeamRow[], fixtures: Fixture[]): TeamRow[] {
  const acc = new Map<string, TeamRow>();
  for (const t of teams) acc.set(t.id, { ...t, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 });
  for (const f of fixtures) {
    if (f.homeGoals == null || f.awayGoals == null) continue;
    const h = acc.get(f.home);
    const a = acc.get(f.away);
    if (!h || !a) continue;
    h.pj += 1; a.pj += 1;
    h.gf += f.homeGoals; h.gc += f.awayGoals;
    a.gf += f.awayGoals; a.gc += f.homeGoals;
    if (f.homeGoals > f.awayGoals) { h.pg += 1; a.pp += 1; }
    else if (f.homeGoals < f.awayGoals) { a.pg += 1; h.pp += 1; }
    else { h.pe += 1; a.pe += 1; }
  }
  return [...acc.values()];
}

/** Formato lindo: 24 mar / 7 abr */
const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y !== new Date().getFullYear() ? y : ""}`.trim();
}

export const DEFAULT_TEAMS: TeamRow[] = [
  { id: "carolino", name: "Carolino", short: "CAROLINO", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "chiveo", name: "Chiveo", short: "CHIVEO", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "maldonado", name: "Maldonado Creadores", short: "MALDONADO CREADORES", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "mazzoni", name: "Mazzoni", short: "MAZZONI", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "quintaafondo", name: "5TA A FONDO", short: "5TA A FONDO", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "sacachispas", name: "Sacachispas", short: "SACACHISPAS", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "vikingos", name: "Vikingos", short: "VIKINGOS", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
];

/** Fixture inicial Serie 1:
 * - Fecha 1 ya jugada (resultados oficiales registrados).
 * - Fechas 2 a 7 pendientes (sin goles, todos en 0).
 *
 * Los ids de los equipos deben coincidir con `DEFAULT_TEAMS.id`.
 */
export const DEFAULT_FIXTURES: Fixture[] = [
  // ── Fecha 1 — 19/09/2026 (jugada) ──────────────────────────────────────────
  { id: "f1-1", home: "quintaafondo", away: "maldonado", date: "2026-09-19", homeGoals: 4, awayGoals: 1, note: "Fecha 1" },
  { id: "f1-2", home: "sacachispas", away: "carolino", date: "2026-09-19", homeGoals: 10, awayGoals: 0, note: "Fecha 1" },
  { id: "f1-3", home: "vikingos", away: "mazzoni", date: "2026-09-19", homeGoals: 1, awayGoals: 7, note: "Fecha 1" },

  // ── Fecha 2 — 26/09/2026 (pendiente) ────────────────────────────────────────
  { id: "f2-1", home: "quintaafondo", away: "sacachispas", date: "2026-09-26", note: "Fecha 2" },
  { id: "f2-2", home: "mazzoni", away: "chiveo", date: "2026-09-26", note: "Fecha 2" },
  { id: "f2-3", home: "carolino", away: "vikingos", date: "2026-09-26", note: "Fecha 2" },

  // ── Fecha 3 — 03/10/2026 (pendiente) ────────────────────────────────────────
  { id: "f3-1", home: "maldonado", away: "chiveo", date: "2026-10-03", note: "Fecha 3" },
  { id: "f3-2", home: "carolino", away: "quintaafondo", date: "2026-10-03", note: "Fecha 3" },
  { id: "f3-3", home: "mazzoni", away: "sacachispas", date: "2026-10-03", note: "Fecha 3" },

  // ── Fecha 4 — 10/10/2026 (pendiente) ────────────────────────────────────────
  { id: "f4-1", home: "carolino", away: "maldonado", date: "2026-10-10", note: "Fecha 4" },
  { id: "f4-2", home: "vikingos", away: "chiveo", date: "2026-10-10", note: "Fecha 4" },
  { id: "f4-3", home: "quintaafondo", away: "mazzoni", date: "2026-10-10", note: "Fecha 4" },

  // ── Fecha 5 — 17/10/2026 (pendiente) ────────────────────────────────────────
  { id: "f5-1", home: "maldonado", away: "vikingos", date: "2026-10-17", note: "Fecha 5" },
  { id: "f5-2", home: "mazzoni", away: "carolino", date: "2026-10-17", note: "Fecha 5" },
  { id: "f5-3", home: "chiveo", away: "sacachispas", date: "2026-10-17", note: "Fecha 5" },

  // ── Fecha 6 — 24/10/2026 (pendiente) ────────────────────────────────────────
  { id: "f6-1", home: "mazzoni", away: "maldonado", date: "2026-10-24", note: "Fecha 6" },
  { id: "f6-2", home: "sacachispas", away: "vikingos", date: "2026-10-24", note: "Fecha 6" },
  { id: "f6-3", home: "quintaafondo", away: "chiveo", date: "2026-10-24", note: "Fecha 6" },

  // ── Fecha 7 — 31/10/2026 (pendiente) ────────────────────────────────────────
  { id: "f7-1", home: "maldonado", away: "sacachispas", date: "2026-10-31", note: "Fecha 7" },
  { id: "f7-2", home: "vikingos", away: "quintaafondo", date: "2026-10-31", note: "Fecha 7" },
  { id: "f7-3", home: "chiveo", away: "carolino", date: "2026-10-31", note: "Fecha 7" },
];

export const teamById = (id: string, teams: TeamRow[]) =>
  teams.find((t) => t.id === id) ?? { id, name: id, short: id.toUpperCase(), pj:0,pg:0,pe:0,pp:0,gf:0,gc:0 };
