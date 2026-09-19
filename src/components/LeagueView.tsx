import { useMemo, useState } from "react";
import {
  computeStandings,
  fmtDate,
  teamById,
  type Fixture,
  LEAGUE_NAME,
} from "@/data/league";
import { useLeagueStore } from "@/store/leagueStore";
import { cn } from "@/utils/cn";

const zoneColor = (i: number) =>
  i === 0
    ? "bg-emerald-400 text-emerald-950"
    : i === 1
      ? "bg-emerald-400/30 text-emerald-400"
      : i === 2
        ? "bg-sky-400/25 text-sky-400"
        : i >= 5
          ? "bg-rose-400/20 text-rose-400"
          : "bg-panel-2 text-faint";

const zoneNote = (i: number) =>
  i === 0 ? "CAMPEÓN" : i === 1 ? "CLASIFICADO" : i === 2 ? "CLASIFICADO" : i >= 5 ? "ÚLTIMOS" : "";

type AdminTab = "tabla" | "fechas";

export default function LeagueView() {
  const league = useLeagueStore();
  const [adminTab, setAdminTab] = useState<AdminTab>("tabla");
  const [newTeam, setNewTeam] = useState("");
  const [newFixture, setNewFixture] = useState({ home: "", away: "", date: "" });

  const standings = useMemo(() => computeStandings(league.teams), [league.teams]);
  const upcoming = useMemo(
    () =>
      [...league.fixtures]
        .filter((f) => f.homeGoals == null || f.awayGoals == null)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [league.fixtures],
  );

  const played = useMemo(
    () =>
      [...league.fixtures]
        .filter((f) => f.homeGoals != null && f.awayGoals != null)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [league.fixtures],
  );

  const maxGoals = Math.max(1, ...league.teams.map((t) => t.gf));

  return (
    <div className="space-y-6">
      {/* cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel p-4">
        <div>
          <p className="font-display text-[10px] tracking-[0.3em] text-amber-500">COMPETENCIA</p>
          <h2 className="font-display text-3xl leading-none tracking-wide text-ink sm:text-4xl">
            {LEAGUE_NAME}
          </h2>
          <p className="mt-1 text-sm text-dim">
            Tabla de posiciones y fechas de los partidos. Activá el modo admin para editarla.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => league.setAdmin(!league.admin)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm tracking-widest transition active:scale-95",
              league.admin
                ? "bg-gradient-to-r from-emerald-400 to-lime-400 text-emerald-950"
                : "border border-line bg-panel-2 text-dim hover:text-ink",
            )}
          >
            {league.admin ? "✔ MODO ADMIN" : "🔒 MODO ADMIN"}
          </button>
          {league.admin && (
            <button
              type="button"
              onClick={() => {
                if (confirm("¿Restaurar la liga a los valores iniciales?")) league.resetLeague();
              }}
              className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 font-display text-sm tracking-widest text-rose-400 transition hover:bg-rose-400/20"
            >
              REINICIAR
            </button>
          )}
        </div>
      </div>

      {/* tabla de posiciones */}
      <section className="overflow-hidden rounded-3xl border border-line bg-panel">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-6">
          <h3 className="font-display text-xl tracking-widest text-ink">TABLA DE POSICIONES</h3>
          <p className="font-display text-[10px] tracking-[0.2em] text-faint">
            PJ · PG · PE · PP · GF · GC · DG · PTS
          </p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <tbody>
              {standings.map((t, i) => {
                const dg = t.gf - t.gc;
                return (
                  <tr
                    key={t.id}
                    className="animate-fade-up border-b border-line/60 last:border-b-0 transition hover:bg-panel-2"
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    <td className="w-12 px-2 py-2.5 sm:px-4">
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-lg font-display text-xs",
                          zoneColor(i),
                        )}
                        title={zoneNote(i)}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="truncate font-semibold text-ink">{t.name}</p>
                    </td>
                    <td className="w-10 text-center font-display text-dim">{t.pj}</td>
                    <td className="w-10 text-center text-emerald-500">{t.pg}</td>
                    <td className="w-10 text-center text-faint">{t.pe}</td>
                    <td className="w-10 text-center text-rose-400">{t.pp}</td>
                    <td className="w-10 text-center text-dim">{t.gf}</td>
                    <td className="w-10 text-center text-dim">{t.gc}</td>
                    <td className="w-10 text-center font-display text-dim">
                      {dg > 0 ? `+${dg}` : dg}
                    </td>
                    <td className="w-14 pr-4 text-right">
                      <span className="inline-flex min-w-10 items-center justify-center rounded-md bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-1 font-display text-base text-amber-950">
                        {t.pts}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap gap-3 border-t border-line px-4 py-3 text-[11px] text-faint sm:px-6">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Campeón y clasificados
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-400/60" /> Copa
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-400/60" /> Zona baja
          </span>
        </footer>
      </section>

      {/* máximos goleadores de equipo */}
      <section className="rounded-3xl border border-line bg-panel p-4 sm:p-6">
        <h3 className="font-display text-xl tracking-widest text-ink">GOLES A FAVOR</h3>
        <div className="mt-3 space-y-2">
          {standings.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3">
              <span className="w-8 font-display text-xs text-faint">{i + 1}º</span>
              <span className="w-32 truncate text-xs font-semibold text-ink sm:w-44">
                {t.short}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-panel-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                  style={{ width: `${(t.gf / maxGoals) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right font-display text-sm text-amber-500">{t.gf}</span>
            </div>
          ))}
        </div>
      </section>

      {/* fechas */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-panel p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl tracking-widest text-ink">
              PRÓXIMAS FECHAS
            </h3>
            <span className="font-display text-[10px] tracking-[0.2em] text-faint">
              {upcoming.length} POR JUGAR
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {upcoming.length === 0 && (
              <li className="rounded-xl bg-panel-2 px-3 py-3 text-sm text-dim">
                No hay fechas pendientes.
              </li>
            )}
            {upcoming.map((f) => (
              <FixtureRow key={f.id} f={f} upcoming />
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-line bg-panel p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl tracking-widest text-ink">RESULTADOS</h3>
            <span className="font-display text-[10px] tracking-[0.2em] text-faint">
              {played.length} JUGADOS
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {played.map((f) => (
              <FixtureRow key={f.id} f={f} />
            ))}
          </ul>
        </div>
      </section>

      {/* ADMIN */}
      {league.admin && (
        <section className="rounded-3xl border-2 border-amber-400/40 bg-panel p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-2xl tracking-widest text-emerald-400">
              MODO ADMIN · EDITAR LIGA
            </h3>
            <div className="flex gap-1">
              {(
                [
                  { id: "tabla", label: "EQUIPOS" },
                  { id: "fechas", label: "FECHAS Y RESULTADOS" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAdminTab(t.id)}
                  className={cn(
                    "rounded-lg px-3 py-2 font-display text-[10px] tracking-widest transition",
                    adminTab === t.id ? "bg-amber-400 text-amber-950" : "bg-panel-2 text-dim",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {adminTab === "tabla" ? (
            <div className="mt-4 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-xs">
                  <thead>
                    <tr className="text-left font-display text-[9px] tracking-[0.2em] text-faint">
                      <th className="px-1 py-2">EQUIPO</th>
                      {["PJ", "PG", "PE", "PP", "GF", "GC"].map((h) => (
                        <th key={h} className="w-14 px-1 text-center">
                          {h}
                        </th>
                      ))}
                      <th className="w-16 px-1 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {league.teams.map((t) => (
                      <tr key={t.id} className="border-t border-line/60">
                        <td className="px-1 py-1.5">
                          <input
                            value={t.name}
                            onChange={(e) =>
                              league.updateTeam(t.id, {
                                name: e.target.value,
                                short: e.target.value.slice(0, 12).toUpperCase(),
                              })
                            }
                            className="w-full min-w-40 rounded-lg border border-line bg-panel px-2 py-1.5 text-ink focus:border-amber-400/60 focus:outline-none"
                          />
                        </td>
                        {(["pj", "pg", "pe", "pp", "gf", "gc"] as const).map((field) => (
                          <td key={field} className="px-1 text-center">
                            <input
                              type="number"
                              min={0}
                              value={t[field]}
                              onChange={(e) =>
                                league.updateTeam(t.id, { [field]: Math.max(0, parseInt(e.target.value) || 0) })
                              }
                              className="w-12 rounded-lg border border-line bg-panel px-1 py-1.5 text-center text-ink focus:border-amber-400/60 focus:outline-none"
                            />
                          </td>
                        ))}
                        <td className="px-1 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Eliminar "${t.name}" y sus partidos?`)) league.removeTeam(t.id);
                            }}
                            className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-2 py-1 font-display text-[10px] tracking-widest text-rose-400"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const n = newTeam.trim();
                  if (n) {
                    league.addTeam(n);
                    setNewTeam("");
                  }
                }}
                className="flex flex-wrap gap-2"
              >
                <input
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  placeholder="Nombre del nuevo equipo…"
                  className="min-w-52 flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-amber-400/60 focus:outline-none"
                />
                <button className="rounded-lg bg-gradient-to-r from-emerald-400 to-lime-400 px-4 py-2 font-display text-xs tracking-widest text-emerald-950">
                  + AGREGAR EQUIPO
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-xs">
                  <thead>
                    <tr className="text-left font-display text-[9px] tracking-[0.2em] text-faint">
                      <th className="px-1 py-2">FECHA</th>
                      <th className="px-1">LOCAL</th>
                      <th className="w-14 px-1 text-center">GL</th>
                      <th className="w-14 px-1 text-center">GV</th>
                      <th className="px-1">VISITANTE</th>
                      <th className="px-1">NOTA</th>
                      <th className="w-10 px-1 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...league.fixtures]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((f) => (
                        <tr key={f.id} className="border-t border-line/60">
                          <td className="px-1 py-1.5">
                            <input
                              type="date"
                              value={f.date}
                              onChange={(e) => league.updateFixture(f.id, { date: e.target.value })}
                              className="rounded-lg border border-line bg-panel px-1.5 py-1.5 text-ink focus:border-amber-400/60 focus:outline-none"
                            />
                          </td>
                          <td className="px-1">
                            <TeamSelect
                              value={f.home}
                              onChange={(v) => league.updateFixture(f.id, { home: v })}
                            />
                          </td>
                          {(["homeGoals", "awayGoals"] as const).map((field) => (
                            <td key={field} className="px-1 text-center">
                              <input
                                type="number"
                                min={0}
                                value={f[field] ?? ""}
                                placeholder="—"
                                onChange={(e) =>
                                  league.updateFixture(f.id, {
                                    [field]: e.target.value === "" ? undefined : Math.max(0, parseInt(e.target.value) || 0),
                                  })
                                }
                                className="w-12 rounded-lg border border-line bg-panel px-1 py-1.5 text-center text-ink focus:border-amber-400/60 focus:outline-none"
                              />
                            </td>
                          ))}
                          <td className="px-1">
                            <TeamSelect
                              value={f.away}
                              onChange={(v) => league.updateFixture(f.id, { away: v })}
                            />
                          </td>
                          <td className="px-1">
                            <input
                              value={f.note ?? ""}
                              onChange={(e) => league.updateFixture(f.id, { note: e.target.value })}
                              placeholder="Fecha Nº…"
                              className="w-28 rounded-lg border border-line bg-panel px-2 py-1.5 text-ink focus:border-amber-400/60 focus:outline-none"
                            />
                          </td>
                          <td className="px-1 text-right">
                            <button
                              type="button"
                              onClick={() => league.removeFixture(f.id)}
                              className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-2 py-1 font-display text-[10px] tracking-widest text-rose-400"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newFixture.date || !newFixture.home || !newFixture.away) return;
                  league.addFixture(newFixture);
                  setNewFixture({ home: "", away: "", date: "" });
                }}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  type="date"
                  value={newFixture.date}
                  onChange={(e) => setNewFixture((f) => ({ ...f, date: e.target.value }))}
                  className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink focus:border-amber-400/60 focus:outline-none"
                />
                <TeamSelect
                  value={newFixture.home}
                  onChange={(v) => setNewFixture((f) => ({ ...f, home: v }))}
                  placeholder="Local"
                />
                <span className="font-display text-dim">vs</span>
                <TeamSelect
                  value={newFixture.away}
                  onChange={(v) => setNewFixture((f) => ({ ...f, away: v }))}
                  placeholder="Visitante"
                />
                <button className="rounded-lg bg-gradient-to-r from-emerald-400 to-lime-400 px-4 py-2 font-display text-xs tracking-widest text-emerald-950">
                  + AGREGAR FECHA
                </button>
              </form>
              <p className="text-[11px] text-faint">
                Si la fecha tiene goles, la tabla de posiciones se recalcula sola. Dejá los goles
                en blanco para marcarla como pendiente.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function TeamSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const teams = useLeagueStore((s) => s.teams);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-44 rounded-lg border border-line bg-panel px-2 py-1.5 text-ink focus:border-amber-400/60 focus:outline-none"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.short}
        </option>
      ))}
    </select>
  );
}

function FixtureRow({ f, upcoming = false }: { f: Fixture; upcoming?: boolean }) {
  const teams = useLeagueStore((s) => s.teams);
  const h = teamById(f.home, teams);
  const a = teamById(f.away, teams);
  const done = f.homeGoals != null && f.awayGoals != null;
  return (
    <li className="flex items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2.5">
      <span className="w-16 shrink-0 text-center font-display text-xs tracking-widest text-dim">
        {fmtDate(f.date)}
      </span>
      <span className="min-w-0 flex-1 truncate text-right text-xs font-semibold text-ink">
        {h.short}
      </span>
      {done ? (
        <span className="flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-400/15 to-lime-400/10 px-2 py-0.5 font-display text-sm text-emerald-400">
          {f.homeGoals}
          <span className="text-faint">–</span>
          {f.awayGoals}
        </span>
      ) : (
        <span className="shrink-0 rounded-lg bg-amber-400/15 px-2 py-0.5 font-display text-[10px] tracking-widest text-amber-500">
          {upcoming ? "POR JUGAR" : "SIN DATO"}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{a.short}</span>
      {f.note && (
        <span className="hidden shrink-0 text-[10px] text-faint sm:inline">{f.note}</span>
      )}
    </li>
  );
}
