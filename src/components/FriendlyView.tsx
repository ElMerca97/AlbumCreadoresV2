import { useEffect, useMemo, useRef, useState } from "react";
import { formationById, type Formation, type SlotDef } from "@/data/formations";
import { pickRival, type Rival } from "@/data/rivals";
import { stickers, type Sticker } from "@/data/stickers";
import {
  canPlayFriendly,
  formatMs,
  friendliesAvailable,
  msUntilNextFriendly,
  useFriendlyStore,
} from "@/store/friendlyStore";
import { useAlbumStore } from "@/store/albumStore";
import { cn } from "@/utils/cn";
import FriendlyEventOverlay, {
  FriendlyOverlayStyles,
} from "./FriendlyEventOverlay";
import {
  HOME_TEAM_NAME,
  rewardForOutcome,
  simulateFriendly,
  type SimPlayer,
  type SimResult,
  type TimelineEvent,
} from "@/lib/friendlySim";
import CoinIcon from "./CoinIcon";

type LineupProblem = {
  slot: SlotDef | null;
  message: string;
};

type LineupCheck =
  | {
      ok: true;
      formation: Formation;
      players: { slot: SlotDef; sticker: Sticker }[];
    }
  | {
      ok: false;
      formation: Formation;
      players: { slot: SlotDef; sticker: Sticker }[];
      problems: LineupProblem[];
    };

/**
 * Valida la alineación actual de Mi Equipo.
 *
 * Comprueba:
 * - formación válida
 * - todos los puestos ocupados
 * - cromo existente
 * - que no sea un escudo
 * - posición compatible con el puesto
 */
export function checkFriendlyLineup(
  lineup: Record<string, number | null>,
  lineupFormat: string,
): LineupCheck {
  const formation = formationById(lineupFormat);
  const players: { slot: SlotDef; sticker: Sticker }[] = [];
  const problems: LineupProblem[] = [];

  for (const slot of formation.slots) {
    const id = lineup[slot.key];

    if (typeof id !== "number") {
      problems.push({
        slot,
        message: `Puesto ${slot.label} (${slot.key}) vacío.`,
      });
      continue;
    }

    const sticker = stickers.find((s) => s.id === id);

    if (!sticker) {
      problems.push({
        slot,
        message: `El cromo ${id} en ${slot.label} ya no existe.`,
      });
      continue;
    }

    // Los escudos no tienen posición ni estadísticas.
    if (!sticker.pos || !sticker.stats) {
      problems.push({
        slot,
        message: `${sticker.name} es un escudo y no puede jugar.`,
      });
      continue;
    }

    if (!slot.accepts.includes(sticker.pos)) {
      problems.push({
        slot,
        message: `${sticker.name} (${sticker.pos}) no es compatible con ${slot.label}.`,
      });
      continue;
    }

    players.push({ slot, sticker });
  }

  if (problems.length > 0) {
    return {
      ok: false,
      formation,
      players,
      problems,
    };
  }

  return {
    ok: true,
    formation,
    players,
  };
}

export function useFriendlyLineup() {
  const lineup = useAlbumStore((s) => s.lineup);
  const lineupFormat = useAlbumStore((s) => s.lineupFormat);

  return useMemo(
    () => checkFriendlyLineup(lineup, lineupFormat),
    [lineup, lineupFormat],
  );
}

type Phase = "ready" | "kickoff" | "playing" | "finished";

/**
 * Partido ya determinado: el SimResult y la recompensa quedan fijados
 * AL INICIAR. OMITIR / animación / re-render solo revelan lo existente.
 */
type LiveMatch = {
  rival: Rival;
  sim: SimResult;
  /** Recompensa fijada una sola vez según el resultado del sim. */
  reward: number;
  /** playerIds de Mi Equipo en este partido (para filtrar estadísticas). */
  homeIds: Set<string>;
};

const OUTCOME_LABEL: Record<SimResult["outcome"], string> = {
  victoria: "¡VICTORIA!",
  empate: "EMPATE",
  derrota: "DERROTA",
};

const OUTCOME_COLOR: Record<SimResult["outcome"], string> = {
  victoria: "text-emerald-400",
  empate: "text-amber-400",
  derrota: "text-rose-400",
};

export default function FriendlyView() {
  const check = useFriendlyLineup();

  const friendliesPlayed = useFriendlyStore((s) => s.friendliesPlayed);
  const registerFriendly = useFriendlyStore((s) => s.registerFriendly);
  const prune = useFriendlyStore((s) => s.prune);
  const recordMatchStats = useFriendlyStore((s) => s.recordMatchStats);
  const playerStats = useFriendlyStore((s) => s.playerStats);

  const [phase, setPhase] = useState<Phase>("ready");
  /** Overlay activo (gol / atajada / palo) — sólo presentación. */
  const [overlay, setOverlay] = useState<TimelineEvent | null>(null);
  /** Medio tiempo: pausa visual, no afecta la simulación. */
  const [halftime, setHalftime] = useState(false);
  /** Ya se mostró el descanso en este partido. */
  const halftimeShownRef = useRef(false);
  /** Partido en vivo: ya simulado y con recompensa fijada. */
  const [match, setMatch] = useState<LiveMatch | null>(null);
  /** Cantidad de eventos ya revelados por la animación. */
  const [revealed, setRevealed] = useState(0);
  /** Garantiza que la recompensa se cobre EXACTAMENTE una vez por partido. */
  const paidRef = useRef(false);
  const [, setTick] = useState(0);

  // Limpia partidos antiguos y actualiza el contador periódicamente.
  useEffect(() => {
    prune();

    const timer = window.setInterval(() => {
      prune();
      setTick((value) => value + 1);
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [prune]);

  const available = friendliesAvailable(friendliesPlayed);
  const canPlay = check.ok && canPlayFriendly(friendliesPlayed);
  const waitMs = msUntilNextFriendly(friendliesPlayed);
  const addCoins = useAlbumStore((s) => s.addCoins);

  const start = () => {
    // Volvemos a comprobar la alineación justo antes de iniciar.
    const currentLineup = useAlbumStore.getState().lineup;
    const currentFormat = useAlbumStore.getState().lineupFormat;

    const fresh = checkFriendlyLineup(currentLineup, currentFormat);

    if (!fresh.ok) {
      return;
    }

    // Comprobamos nuevamente el límite.
    const currentPlayed = useFriendlyStore.getState().friendliesPlayed;

    if (!canPlayFriendly(currentPlayed)) {
      return;
    }

    // Elegimos el rival solamente cuando realmente comienza el partido.
    const selectedRival = pickRival();

    // ── SNAPSHOT de Mi Equipo (Etapa 2, punto 13) ──
    // Si el usuario cambia la alineación durante el partido, este NO cambia.
    const snapshot: SimPlayer[] = fresh.players.map(({ slot, sticker }) => ({
      formationId: fresh.formation.id,
      slotKey: slot.key,
      stickerId: sticker.id,
      playerId: sticker.playerId,
      name: sticker.name,
      pos: sticker.pos!, // checkFriendlyLineup garantiza pos (no escudo)
      rating: sticker.rating ?? 70,
      stats: sticker.stats
        ? {
            Tiro: sticker.stats.Tiro,
            Pase: sticker.stats.Pase,
            Velocidad: sticker.stats.Velocidad,
            Defensa: sticker.stats.Defensa,
          }
        : undefined,
    }));

    // ── SIMULACIÓN ÚNICA (Etapa 2, punto 1) ──
    // Seed + snapshot: el partido completo queda determinado aquí.
    // OMITIR / render / cambiar de pestaña NUNCA vuelven a simular.
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const sim = simulateFriendly({
      formation: fresh.formation,
      home: snapshot,
      rival: selectedRival,
      seed,
    });

    // La recompensa se fija UNA VEZ según el resultado del sim.
    const reward = rewardForOutcome(sim.outcome);

    paidRef.current = false;
    setMatch({
      rival: selectedRival,
      sim,
      reward,
      homeIds: new Set(snapshot.map((p) => p.playerId)),
    });
    setRevealed(0);

    // Consumimos uno de los 3 partidos.
    const registered = registerFriendly();

    if (!registered) {
      return;
    }

    setPhase("kickoff");
  };

  // PREPARANDO PARTIDO... -> PARTIDO EN JUEGO
  useEffect(() => {
    if (phase !== "kickoff") return;
    const t = window.setTimeout(() => setPhase("playing"), 1600);
    return () => window.clearTimeout(t);
  }, [phase]);

  /**
   * Cobra la recompensa y acumula estadísticas al FINALIZAR el partido.
   * Se ejecuta exactamente UNA VEZ (guard con paidRef): ni la animación
   * normal ni OMITIR pueden cobrar ni registrar dos veces. El OMITIR guarda
   * exactamente las mismas estadísticas que ver el partido completo.
   */
  const finishMatch = () => {
    if (paidRef.current || !match) return;
    paidRef.current = true;
    addCoins(match.reward);
    // Etapa 3: estadísticas por playerId (sólo jugadores de Mi Equipo).
    recordMatchStats(
      match.sim.performances
        .filter((p) => match.homeIds.has(p.playerId))
        .map((p) => ({
          playerId: p.playerId,
          name: p.name,
          pos: p.pos,
          goals: p.goals,
          assists: p.assists,
          points: p.points,
        })),
    );
    setPhase("finished");
  };

  // OMITIR: corta animaciones pendientes, revela todo y finaliza SIN re-simular.
  const skipMatch = () => {
    if (!match || paidRef.current) return;
    setOverlay(null);
    setHalftime(false);
    halftimeShownRef.current = true;
    setRevealed(match.sim.timeline.length);
    finishMatch();
  };

  // Reproducción del relato ya generado (NO regenera nada).
  // Máquina de estados por beat:
  //   beat especial (goal/atajada/palo) → overlay → al cerrar avanza el índice
  //   medio tiempo → pausa una sola vez cerca del 45' → CONTINUAR reanuda
  // El OMITIR (skipMatch) corta todo y finaliza sin animaciones pendientes.
  useEffect(() => {
    if (phase !== "playing" || !match) return;

    // Pausa visual del descanso: no avanza hasta pulsar CONTINUAR.
    if (halftime) return;

    const beats = match.sim.timeline;
    const totalMs = Math.min(60_000, Math.max(30_000, 30_000 + beats.length * 1_500));
    const stepMs = beats.length > 0 ? totalMs / beats.length : totalMs;

    // 1) Overlay activo: al terminar la animación avanza el relato.
    if (overlay) {
      const ms =
        overlay.kind === "goal" ? 3200 : overlay.kind === "atajada" ? 1900 : 1500;
      const t = window.setTimeout(() => {
        setOverlay(null);
        setRevealed((r) => Math.min(r + 1, beats.length));
      }, ms);
      return () => window.clearTimeout(t);
    }

    // 2) Ya se reveló todo el relato: finalizar tras una pausa breve.
    if (revealed >= beats.length) {
      const t = window.setTimeout(finishMatch, Math.min(2_500, stepMs));
      return () => window.clearTimeout(t);
    }

    const next = beats[revealed];

    // 3) Medio tiempo: primera vez que el relato cruza el minuto 45.
    if (!halftimeShownRef.current && next.minute > 45) {
      halftimeShownRef.current = true;
      const t = window.setTimeout(() => setHalftime(true), Math.min(800, stepMs));
      return () => window.clearTimeout(t);
    }

    // 4) Beat con animación: muestra el overlay y NO avanza aún.
    if (next.kind === "goal" || next.kind === "atajada" || next.kind === "palo") {
      const t = window.setTimeout(() => setOverlay(next), 350);
      return () => window.clearTimeout(t);
    }

    // 5) Beat normal: avanza al siguiente tras el paso estándar.
    const id = window.setInterval(() => setRevealed((r) => r + 1), stepMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, match, revealed, overlay, halftime]);

  const continueFromHalftime = () => setHalftime(false);

  const backToReady = () => {
    setPhase("ready");
    setMatch(null);
    setRevealed(0);
    setOverlay(null);
    setHalftime(false);
    halftimeShownRef.current = false;
    paidRef.current = false;
  };

  // Marcador progresivo: solo los goles ya revelados en el relato.
  const shownBeats = match ? match.sim.timeline.slice(0, revealed) : [];
  const homeShown = shownBeats.filter(
    (b) => b.kind === "goal" && b.team === "home",
  ).length;
  const awayShown = shownBeats.filter(
    (b) => b.kind === "goal" && b.team === "away",
  ).length;

  // ── Datos del MEDIO TIEMPO (leídos del timeline, sin tocar el motor) ──
  const firstHalf = match ? match.sim.timeline.filter((b) => b.minute <= 45) : [];
  const htGoals = firstHalf.filter((b) => b.kind === "goal");
  const htAssists = htGoals.filter((b) => b.goal?.assist);
  const htShots = firstHalf.filter(
    (b) => b.kind === "remate" || b.kind === "palo",
  ).length;
  const htSaves = firstHalf.filter((b) => b.kind === "atajada").length;

  return (
    <div className="space-y-6">
      <FriendlyOverlayStyles />
      {/* Cabecera */}
      <div className="rounded-2xl border border-line bg-panel p-5">
        <p className="font-display text-[10px] tracking-[0.3em] text-amber-500">
          PARTIDOS AMISTOSOS
        </p>

        <h3 className="mt-1 font-display text-3xl leading-none tracking-wide text-ink">
          PARTIDO AMISTOSO
        </h3>

        <p className="mt-2 text-sm text-dim">
          Juega con la alineación actual de Mi Equipo.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="rounded-xl border border-line bg-black/20 px-4 py-3">
            <p className="text-[10px] tracking-widest text-dim">
              DISPONIBLES
            </p>

            <p className="mt-1 font-display text-2xl text-ink">
              {available}
              <span className="ml-1 text-sm text-dim">/ 3</span>
            </p>
          </div>

          {waitMs > 0 && (
            <div className="rounded-xl border border-line bg-black/20 px-4 py-3">
              <p className="text-[10px] tracking-widest text-dim">
                PRÓXIMO PARTIDO
              </p>

              <p className="mt-1 font-display text-2xl text-amber-400">
                {formatMs(waitMs)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Estado de la alineación (solo antes del partido) */}
      {phase === "ready" && (
      <div className="rounded-2xl border border-line bg-panel p-5">
        <p className="font-display text-xs tracking-widest text-amber-500">
          MI EQUIPO
        </p>

        <h4 className="mt-1 font-display text-2xl text-ink">
          {check.formation.name}
        </h4>

        {check.ok ? (
          <>
            <p className="mt-2 text-sm text-emerald-400">
              ✓ Alineación válida para jugar.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {check.players.map(({ slot, sticker }) => (
                <div
                  key={slot.key}
                  className="rounded-xl border border-line bg-black/20 px-3 py-2"
                >
                  <p className="text-[9px] tracking-widest text-dim">
                    {slot.label}
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-ink">
                    {sticker.name}
                  </p>

                  <p className="text-[10px] text-dim">
                    {sticker.pos} · {sticker.rating}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-red-400">
              ✕ No puedes jugar todavía. Corrige la alineación.
            </p>

            <div className="mt-4 space-y-2">
              {check.problems.map((problem, index) => (
                <div
                  key={`${problem.slot?.key ?? "problem"}-${index}`}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-300"
                >
                  {problem.message}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      )}

      {/* ── PARTIDO RÁPIDO (transmisión) ── */}
      {(phase === "kickoff" || phase === "playing") && match && (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-panel p-5">
          <p className="font-display text-[10px] tracking-[0.3em] text-amber-500">
            PARTIDO RÁPIDO
          </p>

          {phase === "kickoff" ? (
            <h4 className="mt-4 animate-pulse font-display text-2xl tracking-widest text-ink">
              PREPARANDO PARTIDO...
            </h4>
          ) : (
            <h4 className="mt-4 font-display text-lg tracking-widest text-emerald-400">
              PARTIDO EN JUEGO
            </h4>
          )}

          {/* Marcador */}
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <p className="text-right font-display text-sm tracking-wide text-ink sm:text-base">
              {HOME_TEAM_NAME}
            </p>
            <p className="rounded-xl border border-line bg-black/30 px-4 py-2 font-display text-3xl text-ink">
              {homeShown} - {awayShown}
            </p>
            <p className="font-display text-sm tracking-wide text-ink sm:text-base">
              {match.rival.name}
            </p>
          </div>

          {/* Minuto en juego */}
          {phase === "playing" && (
            <p className="mt-2 text-center font-display text-xs tracking-widest text-faint">
              {Math.min(
                90,
                Math.round((revealed / Math.max(1, match.sim.timeline.length)) * 90),
              )}'
            </p>
          )}

          {/* Relato revelado progresivamente (ya generado) */}
          <div className="mt-5 min-h-48 space-y-2">
            {shownBeats.map((b, i) => (
              <div
                key={`${b.minute}-${i}`}
                className={cn(
                  "animate-fade-up rounded-xl border px-4 py-2.5",
                  b.kind === "goal"
                    ? "border-amber-500/40 bg-amber-500/10"
                    : b.kind === "comentario"
                      ? "border-line bg-panel-2/60"
                      : "border-line bg-black/20",
                )}
              >
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-[10px] tracking-widest text-faint">
                    {b.minute}'
                  </p>
                  {b.kind === "goal" && b.goal?.team === "away" && (
                    <p className="font-display text-[10px] tracking-widest text-dim">
                      {match.rival.name}
                    </p>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-sm",
                    b.kind === "goal"
                      ? "font-semibold text-amber-300"
                      : b.kind === "comentario"
                        ? "italic text-dim"
                        : "text-ink",
                  )}
                >
                  {b.kind === "goal" ? "⚽ " : b.kind === "atajada" ? "🧤 " : b.kind === "palo" ? "🥅 " : ""}
                  {b.text}
                </p>
              </div>
            ))}
            {phase === "playing" && revealed < match.sim.timeline.length && (
              <p className="text-center text-xs text-faint">...</p>
            )}
          </div>

          {/* OMITIR: corta animaciones pendientes y finaliza sin re-simular */}
          {phase === "playing" && !overlay && !halftime && (
            <button
              type="button"
              onClick={skipMatch}
              className="mt-5 w-full rounded-xl border border-line-strong bg-panel-2 px-6 py-3 font-display text-sm tracking-[0.2em] text-ink transition hover:bg-line-strong"
            >
              OMITIR
            </button>
          )}

          {/* ETAPA 4A: overlays de gol / atajada / palo */}
          {overlay && <FriendlyEventOverlay beat={overlay} rivalName={match.rival.name} />}

          {/* ETAPA 4A: MEDIO TIEMPO (pausa visual, una sola vez) */}
          {halftime && (
            <div className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-page/90 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-5 text-center shadow-2xl">
                <p className="font-display text-xs tracking-[0.4em] text-amber-500">
                  ━━━━━━━━━━━━━━━━
                </p>
                <p className="mt-1 font-display text-2xl tracking-[0.3em] text-ink">
                  MEDIO TIEMPO
                </p>
                <p className="font-display text-xs tracking-[0.4em] text-amber-500">
                  ━━━━━━━━━━━━━━━━
                </p>

                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <p className="text-right font-display text-xs tracking-wide text-ink sm:text-sm">
                    {HOME_TEAM_NAME}
                  </p>
                  <p className="rounded-xl border border-line bg-black/30 px-3 py-1.5 font-display text-2xl text-ink">
                    {homeShown} - {awayShown}
                  </p>
                  <p className="font-display text-xs tracking-wide text-ink sm:text-sm">
                    {match.rival.name}
                  </p>
                </div>

                <div className="mt-4 text-left">
                  <p className="font-display text-[10px] tracking-widest text-dim">
                    ⚽ GOLEADORES DEL PRIMER TIEMPO
                  </p>
                  {htGoals.length === 0 ? (
                    <p className="mt-1 text-xs text-faint">
                      Sin goles en la primera mitad.
                    </p>
                  ) : (
                    <ul className="mt-1.5 space-y-1">
                      {htGoals.map((g, i) => (
                        <li
                          key={i}
                          className="flex items-baseline gap-2 text-xs text-ink"
                        >
                          <span className="min-w-0 truncate font-semibold">
                            {g.goal?.scorer}
                          </span>
                          <span className="flex-1 border-b border-dashed border-line" />
                          <span className="font-display text-faint">
                            {g.minute}'
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="mt-3 font-display text-[10px] tracking-widest text-dim">
                    🎯 ASISTENCIAS
                  </p>
                  {htAssists.length === 0 ? (
                    <p className="mt-1 text-xs text-faint">
                      Sin asistencias en la primera mitad.
                    </p>
                  ) : (
                    <ul className="mt-1.5 space-y-1">
                      {htAssists.map((g, i) => (
                        <li key={i} className="text-xs text-cyan-300">
                          {g.goal?.assist} → {g.goal?.scorer}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "REMATES", value: htShots },
                      { label: "ATAJADAS", value: htSaves },
                      { label: "GOLES", value: htGoals.length },
                      { label: "ASIST.", value: htAssists.length },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-lg border border-line bg-black/20 px-1 py-1.5"
                      >
                        <p className="font-display text-sm text-ink">{value}</p>
                        <p className="font-display text-[8px] tracking-widest text-faint">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={continueFromHalftime}
                  className="mt-5 w-full rounded-xl bg-amber-500 px-6 py-3 font-display text-sm tracking-[0.2em] text-black transition hover:brightness-110 active:scale-95"
                >
                  CONTINUAR
                </button>
                <button
                  type="button"
                  onClick={skipMatch}
                  className="mt-2 w-full rounded-xl px-6 py-2 font-display text-[10px] tracking-[0.3em] text-faint transition hover:text-ink"
                >
                  OMITIR
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FINALIZÓ EL PARTIDO — recompensa ya cobrada (una sola vez) */}
      {phase === "finished" && match && (
        <div className="rounded-2xl border border-line bg-panel p-6 text-center">
          <p className="font-display text-xs tracking-[0.3em] text-dim">
            FINALIZÓ EL PARTIDO · {match.rival.name}
          </p>

          <p className="mt-4 font-display text-3xl text-ink">
            {match.sim.homeGoals} - {match.sim.awayGoals}
          </p>

          <h4
            className={`mt-2 font-display text-4xl tracking-wide ${OUTCOME_COLOR[match.sim.outcome]}`}
          >
            {OUTCOME_LABEL[match.sim.outcome]}
          </h4>

          <p className="mt-3 font-display text-xl text-amber-300">
            +{match.reward} <CoinIcon />
          </p>

          <p className="mt-2 text-xs text-dim">
            Recompensa acreditada en tus monedas.
          </p>

          <button
            type="button"
            onClick={backToReady}
            className="mt-5 w-full rounded-xl bg-panel-2 px-6 py-3 font-display text-sm tracking-[0.2em] text-ink transition hover:bg-line-strong"
          >
            VOLVER
          </button>
        </div>
      )}

      {/* Botón */}
      {phase === "ready" && (
        <button
          type="button"
          onClick={start}
          disabled={!canPlay}
          className={[
            "w-full rounded-2xl px-6 py-4 font-display text-sm tracking-[0.2em] transition",
            canPlay
              ? "bg-amber-500 text-black hover:brightness-110"
              : "cursor-not-allowed bg-panel text-dim opacity-60",
          ].join(" ")}
        >
          {!check.ok
            ? "CORREGÍ LA ALINEACIÓN"
            : available <= 0
              ? `SIN PARTIDOS · ${formatMs(waitMs)}`
              : "JUGAR AMISTOSO"}
        </button>
      )}

      {/* ── ESTADÍSTICAS DE MI EQUIPO (Etapa 3) ── */}
      {phase === "ready" && (
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="font-display text-[10px] tracking-[0.3em] text-amber-500">
            ESTADÍSTICAS DE MI EQUIPO
          </p>

          {(() => {
            const stats = Object.values(playerStats);

            if (stats.length === 0) {
              return (
                <p className="mt-3 text-sm text-dim">
                  Todavía no jugaste amistosos. Las estadísticas de tus jugadores
                  aparecerán acá después del primer partido.
                </p>
              );
            }

            const best = [...stats].sort(
              (a, b) => b.points - a.points || b.goals - a.goals,
            )[0];
            const topScorer = [...stats]
              .sort((a, b) => b.goals - a.goals || b.points - a.points)
              .find((s) => s.goals > 0);
            const topAssist = [...stats]
              .sort((a, b) => b.assists - a.assists || b.points - a.points)
              .find((s) => s.assists > 0);
            const topApps = [...stats].sort(
              (a, b) => b.appearances - a.appearances || b.points - a.points,
            )[0];

            const scorers = stats
              .filter((s) => s.goals > 0)
              .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
            const assisters = stats
              .filter((s) => s.assists > 0)
              .sort((a, b) => b.assists - a.assists || a.name.localeCompare(b.name));

            return (
              <>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "MEJOR JUGADOR", s: best, value: `${best.points} pts` },
                    {
                      label: "MÁXIMO GOLEADOR",
                      s: topScorer,
                      value: topScorer ? `${topScorer.goals} ⚽` : "—",
                    },
                    {
                      label: "MÁXIMO ASISTIDOR",
                      s: topAssist,
                      value: topAssist ? `${topAssist.assists} 🎯` : "—",
                    },
                    {
                      label: "MÁS PARTIDOS",
                      s: topApps,
                      value: `${topApps.appearances} PJ`,
                    },
                  ].map(({ label, s, value }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-line bg-black/20 px-3 py-2.5"
                    >
                      <p className="font-display text-[9px] tracking-widest text-dim">
                        {label}
                      </p>
                      {s ? (
                        <>
                          <p className="mt-1 truncate text-sm font-semibold text-ink">
                            {s.name}
                          </p>
                          <p className="font-display text-xs text-amber-400">
                            {value}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-faint">—</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="font-display text-[10px] tracking-widest text-dim">
                      GOLEADORES
                    </p>
                    {scorers.length === 0 ? (
                      <p className="mt-1.5 text-xs text-faint">Sin goles todavía.</p>
                    ) : (
                      <ul className="mt-1.5 space-y-1">
                        {scorers.map((s, i) => (
                          <li
                            key={s.playerId}
                            className="flex items-center gap-2 rounded-lg bg-panel-2 px-2.5 py-1.5 text-xs"
                          >
                            <span className="w-5 font-display text-faint">{i + 1}.</span>
                            <span className="min-w-0 flex-1 truncate text-ink">
                              {s.name}
                            </span>
                            <span className="font-display text-amber-400">
                              {s.goals} ⚽
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="font-display text-[10px] tracking-widest text-dim">
                      ASISTIDORES
                    </p>
                    {assisters.length === 0 ? (
                      <p className="mt-1.5 text-xs text-faint">
                        Sin asistencias todavía.
                      </p>
                    ) : (
                      <ul className="mt-1.5 space-y-1">
                        {assisters.map((s, i) => (
                          <li
                            key={s.playerId}
                            className="flex items-center gap-2 rounded-lg bg-panel-2 px-2.5 py-1.5 text-xs"
                          >
                            <span className="w-5 font-display text-faint">{i + 1}.</span>
                            <span className="min-w-0 flex-1 truncate text-ink">
                              {s.name}
                            </span>
                            <span className="font-display text-cyan-400">
                              {s.assists} 🎯
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}