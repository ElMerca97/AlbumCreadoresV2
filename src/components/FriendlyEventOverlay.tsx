import type { TimelineEvent } from "@/lib/friendlySim";
import { cn } from "@/utils/cn";

type Props = {
  beat: TimelineEvent;
  rivalName: string;
};

/**
 * ETAPA 4A — Overlay de animaciones del partido (gol / atajada / palo).
 * Sólo presenta datos ya calculados: no modifica marcador, eventos ni stats.
 */
export default function FriendlyEventOverlay({ beat, rivalName }: Props) {
  if (beat.kind === "goal" && beat.goal) {
    const g = beat.goal;
    const home = g.team === "home";
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-2xl">
        {/* flash de impacto */}
        <div className="goal-flash absolute inset-0 bg-amber-300/25" />
        {/* confeti */}
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="confetti absolute top-0 h-3 w-1.5 rounded-sm"
            style={{
              left: `${6 + i * 6.6}%`,
              animationDelay: `${(i % 5) * 0.12}s`,
              background:
                i % 3 === 0
                  ? "#fbbf24"
                  : i % 3 === 1
                    ? "#22d3ee"
                    : "#34d399",
            }}
          />
        ))}

        <div
          className={cn(
            "goal-pop relative mx-4 rounded-2xl border px-6 py-5 text-center shadow-2xl backdrop-blur-md sm:px-10 sm:py-7",
            home
              ? "border-amber-400/60 bg-amber-500/15"
              : "border-rose-400/50 bg-rose-500/15",
          )}
        >
          <p className="goal-title font-display text-3xl tracking-widest text-amber-300 drop-shadow-lg sm:text-5xl">
            ⚽ ¡GOOOOOOOL!
          </p>
          <p className="mt-2 font-display text-xl tracking-wide text-ink sm:text-3xl">
            {g.scorer}
          </p>
          <p className="mt-1 font-display text-[10px] tracking-[0.25em] text-dim">
            {home ? "SELECCIÓN DE CREADORES" : rivalName}
          </p>
          {g.assist && (
            <p className="goal-assist mt-2 text-sm text-cyan-300 sm:text-base">
              🎯 Asistencia: {g.assist}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (beat.kind === "atajada") {
    // El texto del sim contiene el nombre del arquero; si la atajada es del
    // arquero local (beat.team === "away" atacaba), es salvada de la Selección.
    const homeSave = beat.team === "away";
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl">
        <div className="save-pop rounded-2xl border border-cyan-400/60 bg-cyan-500/15 px-6 py-4 text-center shadow-xl backdrop-blur-md sm:px-9">
          <p className="font-display text-2xl tracking-widest text-cyan-300 sm:text-3xl">
            🧤 ¡QUÉ ATAJADA!
          </p>
          <p className="mt-1.5 text-sm font-semibold text-ink sm:text-base">
            {homeSave
              ? "¡¡ATAJADÓN: SALVÓ A LA SELECCIÓN!!"
              : "¡Buena intervención!"}
          </p>
          <p className="mt-1 text-xs text-dim">{beat.text}</p>
        </div>
      </div>
    );
  }

  if (beat.kind === "palo") {
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl">
        <div className="post-impact rounded-2xl border border-orange-400/60 bg-orange-500/15 px-6 py-3.5 text-center shadow-xl backdrop-blur-md sm:px-9">
          <p className="font-display text-xl tracking-widest text-orange-300 sm:text-2xl">
            💥 ¡AL PALO!
          </p>
          <p className="mt-1 text-xs text-dim">{beat.text}</p>
        </div>
      </div>
    );
  }

  return null;
}

/** Keyframes CSS de las animaciones (sin librerías nuevas). */
export function FriendlyOverlayStyles() {
  return (
    <style>{`
      @keyframes goalPop {
        0% { transform: scale(0.4); opacity: 0; }
        55% { transform: scale(1.12); opacity: 1; }
        75% { transform: scale(0.97); }
        100% { transform: scale(1); opacity: 1; }
      }
      .goal-pop { animation: goalPop 0.55s cubic-bezier(0.22, 1.4, 0.4, 1) both; }

      @keyframes goalFlash {
        0% { opacity: 0; }
        18% { opacity: 1; }
        100% { opacity: 0; }
      }
      .goal-flash { animation: goalFlash 0.7s ease-out both; }

      @keyframes goalTitle {
        0% { letter-spacing: 0.5em; opacity: 0; }
        100% { letter-spacing: 0.12em; opacity: 1; }
      }
      .goal-title { animation: goalTitle 0.7s ease-out both; }

      @keyframes goalAssist {
        0%, 40% { opacity: 0; transform: translateY(6px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .goal-assist { animation: goalAssist 0.8s ease-out both; }

      @keyframes confettiFall {
        0% { transform: translateY(-30px) rotate(0deg); opacity: 0; }
        12% { opacity: 1; }
        100% { transform: translateY(320px) rotate(420deg); opacity: 0; }
      }
      .confetti { animation: confettiFall 1.6s linear both; }

      @keyframes savePop {
        0% { transform: translateX(-60px) scale(0.9); opacity: 0; }
        60% { transform: translateX(6px) scale(1.05); opacity: 1; }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      .save-pop { animation: savePop 0.4s cubic-bezier(0.2, 1.2, 0.4, 1) both; }

      @keyframes postImpact {
        0% { transform: scale(0.7); opacity: 0; }
        35% { transform: scale(1.15); opacity: 1; }
        50% { transform: scale(0.96) translateX(-3px); }
        65% { transform: scale(1.02) translateX(3px); }
        100% { transform: scale(1) translateX(0); opacity: 1; }
      }
      .post-impact { animation: postImpact 0.45s ease-out both; }
    `}</style>
  );
}