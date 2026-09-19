import { useEffect, useMemo, useState } from "react";
import type { Formation, SlotDef } from "@/data/formations";
import { stickers, type Sticker } from "@/data/stickers";
import { rarityTheme, shortName } from "@/lib/rarity";
import { useAlbumStore, useOwnedSet } from "@/store/albumStore";
import { cn } from "@/utils/cn";

type Props = {
  slot: SlotDef | null;
  formation: Formation;
  /** jugador cuyas versiones queremos ver (si venimos de la cancha) */
  initialPlayerId?: string | null;
  onClose: () => void;
};

const versionsOf = (playerId: string) =>
  stickers
    .filter((s) => s.playerId === playerId && s.stats)
    .sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));

export default function PlayerPicker({ slot, formation, initialPlayerId, onClose }: Props) {
  const ownedSet = useOwnedSet();
  const assignSlot = useAlbumStore((s) => s.assignSlot);
  const lineup = useAlbumStore((s) => s.lineup);

  const [playerId, setPlayerId] = useState<string | null>(initialPlayerId ?? null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  /** Jugadores (una entrada por playerId) con su mejor versión. */
  const players = useMemo(() => {
    const map = new Map<string, Sticker>();
    for (const s of stickers) {
      if (!s.stats || !s.pos) continue;
      const prev = map.get(s.playerId);
      if (!prev || (s.rating ?? 0) > (prev.rating ?? 0)) map.set(s.playerId, s);
    }
    return [...map.values()];
  }, []);

  const onPitch = useMemo(() => {
    if (!slot) return new Set<number>();
    return new Set(
      formation.slots
        .map((x) => lineup[x.key])
        .filter((v): v is number => typeof v === "number"),
    );
  }, [slot, formation, lineup]);

  const candidates = useMemo(() => {
    if (!slot) return [];
    const q = query.trim().toLowerCase();
    return players
      .filter((p) => (showAll ? true : slot.accepts.includes(p.pos!)))
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          versionsOf(p.playerId).some((v) => v.version.toLowerCase().includes(q)),
      )
      .map((p) => {
        const vs = versionsOf(p.playerId);
        const owned = vs.filter((v) => ownedSet.has(v.id));
        const best = owned.length
          ? owned.reduce((a, b) => ((b.rating ?? 0) > (a.rating ?? 0) ? b : a))
          : vs[vs.length - 1];
        return { player: p, versions: vs, ownedCount: owned.length, best };
      })
      .sort((a, b) => {
        if (b.ownedCount !== a.ownedCount) return b.ownedCount - a.ownedCount;
        return (b.best.rating ?? 0) - (a.best.rating ?? 0);
      });
  }, [players, slot, showAll, query, ownedSet]);

  const current = playerId ? versionsOf(playerId) : [];
  const currentName = current[0]?.name ?? "";

  const assign = (stickerId: number, pos?: string) => {
    if (!slot) return;
    // si la versión tiene otra posición, avisamos pero dejamos alinearla
    if (pos && !slot.accepts.includes(pos)) {
      /* se permite fuera de posición */
    }
    assignSlot(slot.key, stickerId);
    setFlash(stickerId);
    window.setTimeout(onClose, 260);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-pop relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-line bg-page-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            {slot ? (
              <>
                <p className="font-display text-[10px] tracking-[0.3em] text-amber-500">
                  {formation.name} · PUESTO {slot.label}
                </p>
                <h2 className="font-display text-2xl leading-none tracking-wide text-ink sm:text-3xl">
                  {playerId ? `VERSIONES DE ${currentName.toUpperCase()}` : "ELEGÍ EL JUGADOR"}
                </h2>
              </>
            ) : (
              <h2 className="font-display text-2xl tracking-wide text-ink sm:text-3xl">
                VERSIONES DE {currentName.toUpperCase()}
              </h2>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-2 text-dim transition hover:bg-line-strong hover:text-ink"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* contenido */}
        {playerId ? (
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-dim">
                {current.length} {current.length === 1 ? "versión disponible" : "versiones disponibles"}
                {" · "}
                tiene {current.filter((v) => ownedSet.has(v.id)).length}
              </p>
              <button
                type="button"
                onClick={() => setPlayerId(null)}
                className="rounded-lg border border-line px-3 py-1.5 font-display text-[10px] tracking-widest text-dim transition hover:border-line-strong hover:text-ink"
              >
                ‹ VOLVER A LA LISTA
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {current.map((v, i) => {
                const owned = ownedSet.has(v.id);
                const t = rarityTheme(v);
                const isOnPitch = onPitch.has(v.id);
                return (
                  <div
                    key={v.id}
                    className={cn(
                      "animate-fade-up rounded-2xl border p-2.5 transition",
                      owned ? "border-line bg-panel" : "border-line bg-panel opacity-70",
                      flash === v.id && "border-emerald-400 ring-2 ring-emerald-400/40",
                    )}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 font-display text-[9px] tracking-[0.15em]",
                          owned ? t.badge : "bg-panel-2 text-faint",
                        )}
                      >
                        {v.version.replace("VERSION ", "")}
                      </span>
                      <span className="font-display text-lg text-ink">{v.rating}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                          t.initials,
                        )}
                      >
                        <span className="font-display text-sm text-slate-900">
                          {v.pos ?? "—"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-ink">
                          {shortName(v.name)}
                        </p>
                        <p className="truncate text-[10px] text-faint">
                          {v.pos} · Nº {v.number ?? "—"} · media {v.rating}
                        </p>
                      </div>
                    </div>

                    {owned ? (
                      <div className="mt-2.5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => assign(v.id, v.pos)}
                          className={cn(
                            "flex-1 rounded-lg px-2 py-2 font-display text-[11px] tracking-widest transition active:scale-95",
                            isOnPitch
                              ? "bg-emerald-400 text-emerald-950"
                              : "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 hover:brightness-110",
                          )}
                        >
                          {isOnPitch ? "EN LA CANCHA" : slot ? "ALINEAR" : "PEGADA"}
                        </button>
                        {slot && (
                          <button
                            type="button"
                            onClick={() => assignSlot(slot.key, null)}
                            className="rounded-lg border border-line px-2 py-2 font-display text-[11px] tracking-widest text-dim transition hover:border-line-strong hover:text-ink"
                            title="Liberar el puesto"
                          >
                            ⨯
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2.5 space-y-2">
                        <p className="rounded-lg bg-panel-2 px-2 py-1.5 text-center font-display text-[10px] tracking-widest text-faint">
                          🔒 NO LA TENÉS
                        </p>
                        <p className="px-2 text-center text-[10px] text-faint">
                          Conseguí esta versión en un sobre para alinearla.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar jugador o versión…"
                autoFocus
                className="min-w-0 flex-1 rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-amber-400/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className={cn(
                  "rounded-xl px-3 py-2 font-display text-[10px] tracking-widest transition",
                  showAll ? "bg-amber-400 text-amber-950" : "bg-panel-2 text-dim hover:text-ink",
                )}
              >
                {showAll ? "TODOS LOS JUGADORES" : `SOLO ${slot?.label ?? ""}`}
              </button>
            </div>

            <div className="mt-4 max-h-[58vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {candidates.map(({ player, ownedCount, best }, i) => {
                  const t = rarityTheme(best);
                  const inPos = slot ? slot.accepts.includes(player.pos!) : true;
                  return (
                    <button
                      key={player.playerId}
                      type="button"
                      onClick={() => {
                        if (ownedCount === 0) {
                          setPlayerId(player.playerId);
                        } else if (ownedCount > 1) {
                          setPlayerId(player.playerId);
                        } else {
                          assign(best.id, player.pos);
                        }
                      }}
                      className={cn(
                        "animate-fade-up flex items-center gap-3 rounded-2xl border border-line bg-panel p-2.5 text-left transition hover:border-amber-400/60 hover:bg-panel-2",
                        (!inPos || ownedCount === 0) && "opacity-60",
                      )}
                      style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                    >
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                          t.initials,
                        )}
                      >
                        <span className="font-display text-sm text-slate-900">{player.pos}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {shortName(player.name)}
                        </p>
                        <p className="truncate text-[10px] text-faint">
                          {ownedCount} {ownedCount === 1 ? "versión" : "versiones"} · mejor media{" "}
                          {best.rating}
                          {!inPos && " · fuera de posición"}
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-[10px] tracking-widest text-amber-500">
                        {ownedCount === 0 ? "BLOQUEADO" : ownedCount > 1 ? "VERSIONES ›" : "ELEGIR"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {candidates.length === 0 && (
                <p className="py-10 text-center text-sm text-dim">
                  No hay jugadores que coincidan. Probá con “TODOS LOS JUGADORES”.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
