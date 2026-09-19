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
  { id: "seleccion", name: "Selección de Maldonado de Creadores", short: "SEL. MALDONADO", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "carolino", name: "FC Carolino", short: "FC CAROLINO", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "chiveo", name: "Chiveo Fútbol Club", short: "CHIVEO", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "mazzoni", name: "Mazzoni FC", short: "MAZZONI", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "sacachispas", name: "Sacachispas FC", short: "SACACHISPAS", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "presion", name: "Presión", short: "PRESIÓN", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
  { id: "vikingos", name: "Vikingos", short: "VIKINGOS", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
];

/** Fixture inicial: todos los partidos sin jugar (sin goles -> 0-0 en la tabla). */
export const DEFAULT_FIXTURES: Fixture[] = [
  { id: "f1", home: "seleccion", away: "presion", date: "2026-09-21" },
  { id: "f2", home: "carolino", away: "chiveo", date: "2026-09-21" },
  { id: "f3", home: "vikingos", away: "seleccion", date: "2026-09-24" },
  { id: "f4", home: "mazzoni", away: "chiveo", date: "2026-09-24" },
  { id: "f5", home: "presion", away: "carolino", date: "2026-09-28" },
  { id: "f6", home: "seleccion", away: "sacachispas", date: "2026-09-28" },
  { id: "f7", home: "chiveo", away: "sacachispas", date: "2026-10-01" },
  { id: "f8", home: "mazzoni", away: "presion", date: "2026-10-01" },
  { id: "f9", home: "carolino", away: "vikingos", date: "2026-10-05" },
  { id: "f10", home: "sacachispas", away: "mazzoni", date: "2026-10-05" },
  { id: "f11", home: "seleccion", away: "mazzoni", date: "2026-10-08" },
  { id: "f12", home: "sacachispas", away: "carolino", date: "2026-10-12" },
  { id: "f13", home: "presion", away: "chiveo", date: "2026-10-12" },
  { id: "f14", home: "vikingos", away: "mazzoni", date: "2026-10-15" },
  { id: "f15", home: "seleccion", away: "chiveo", date: "2026-10-19" },
  { id: "f16", home: "carolino", away: "mazzoni", date: "2026-10-22" },
  { id: "f17", home: "presion", away: "sacachispas", date: "2026-10-26" },
  { id: "f18", home: "vikingos", away: "presion", date: "2026-10-29" },
];

export const teamById = (id: string, teams: TeamRow[]) =>
  teams.find((t) => t.id === id) ?? { id, name: id, short: id.toUpperCase(), pj:0,pg:0,pe:0,pp:0,gf:0,gc:0 };
