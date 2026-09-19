import { useMemo, useState } from "react";
import { FORMATS, formationsFor, formationById, type SlotDef } from "@/data/formations";
import { stickers, type Sticker } from "@/data/stickers";
import { shortName } from "@/lib/rarity";
import { useAlbumStore, useOwnedSet } from "@/store/albumStore";
import { cn } from "@/utils/cn";
import PlayerPicker from "./PlayerPicker";
import StickerCard from "./StickerCard";

type Props = {
  onOpenCard: (s: Sticker) => void;
};

export default function LineupView({ onOpenCard }: Props) {
  const ownedSet = useOwnedSet();
  const lineup = useAlbumStore((s) => s.lineup);
  const assignSlot = useAlbumStore((s) => s.assignSlot);
  const formatId = useAlbumStore((s) => s.lineupFormat);
  const setFormat = useAlbumStore((s) => s.setLineupFormat);

  const formation = useMemo(() => formationById(formatId), [formatId]);
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const [picker, setPicker] = useState<{
    slot: SlotDef | null;
    playerId?: string | null;
  } | null>(null);

  /** Abre el modal sobre un jugador que ya está en la cancha (muestra sus versiones). */
  const openVersions = (sticker: Sticker) => {
    const slot = formation.slots.find((s) => lineup[s.key] === sticker.id) ?? null;
    setPicker({ slot, playerId: sticker.playerId });
  };

  const filled = formation.slots
    .map((s) => lineup[s.key])
    .filter((v): v is number => typeof v === "number");

  const selected = filled
    .map((id) => stickers.find((s) => s.id === id))
    .filter((s): s is Sticker => Boolean(s));

  const avg = selected.length
    ? Math.round(selected.reduce((sum, s) => sum + (s.rating ?? 0), 0) / selected.length)
    : 0;

  const autoFill = () => {
    const usedPlayers = new Set<string>();
    formation.slots.forEach((slot) => {
      const best = stickers
        .filter(
          (s) =>
            s.stats &&
            s.pos &&
            slot.accepts.includes(s.pos) &&
            ownedSet.has(s.id) &&
            !usedPlayers.has(s.playerId),
        )
        .sort((a, b) => {
          // Primero se prioriza el puesto exacto (DEF en DEF, DEL en DEL),
          // y recién después la media. Las posiciones compatibles son respaldo.
          const aExact = a.pos === slot.label ? 0 : 1;
          const bExact = b.pos === slot.label ? 0 : 1;
          return aExact - bExact || (b.rating ?? 0) - (a.rating ?? 0);
        })[0];
      if (best) {
        usedPlayers.add(best.playerId);
        assignSlot(slot.key, best.id);
      } else {
        assignSlot(slot.key, null);
      }
    });
  };

  const clear = () => formation.slots.forEach((s) => assignSlot(s.key, null));

  const formats = FORMATS;
  const options = formationsFor(formation.format);

  return (
    <div className="space-y-6">
      {/* Panel de armado */}
      <div className="rounded-2xl border border-line bg-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl tracking-wide text-ink">ARMÁ TU EQUIPO</h3>
            <p className="text-sm text-dim">
              Elegí el formato y la formación, después tocá cada puesto para buscar al jugador.
              Tocá una figurita ya puesta para ver todas sus versiones.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-center">
              <p className="font-display text-[10px] tracking-[0.2em] text-amber-500">MEDIA</p>
              <p className="font-display text-2xl leading-none text-ink">{avg || "--"}</p>
            </div>
            <button
              type="button"
              onClick={autoFill}
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 px-4 py-2.5 font-display tracking-widest text-emerald-950 transition hover:brightness-110 active:scale-95"
            >
              EQUIPO AUTOMÁTICO
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-xl bg-panel-2 px-4 py-2.5 font-display tracking-widest text-ink transition hover:bg-line-strong"
            >
              LIMPIAR
            </button>
          </div>
        </div>

        {/* Formato */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="font-display text-[10px] tracking-[0.2em] text-faint">FORMATO</span>
          {formats.map((f) => (
            <button
              key={f.format}
              type="button"
              onClick={() => setFormat(formationsFor(f.format)[0].id)}
              title={f.blurb}
              className={cn(
                "rounded-xl px-3.5 py-2 font-display text-xs tracking-[0.15em] transition",
                formation.format === f.format
                  ? "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950"
                  : "bg-panel-2 text-dim hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto font-display text-[10px] tracking-[0.2em] text-faint">
            {filled.length}/{formation.slots.length} PUESTOS
          </span>
        </div>

        {/* Formación */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-display text-[10px] tracking-[0.2em] text-faint">FORMACIÓN</span>
          {options.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 font-display text-xs tracking-[0.15em] transition",
                f.id === formation.id
                  ? "border-amber-400 bg-amber-400/15 text-amber-500"
                  : "border-line text-dim hover:border-line-strong hover:text-ink",
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cancha */}
      <div className="relative">
        {/* sólo el fondo se recorta: así ninguna figurita queda cortada */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-emerald-900 via-emerald-950 to-black">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute inset-x-3 inset-y-3 rounded-lg border-2 border-white/50" />
            <div className="absolute top-1/2 right-3 left-3 h-0.5 -translate-y-1/2 bg-white/50" />
            <div className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50" />
            <div className="absolute top-3 left-1/2 h-14 w-40 -translate-x-1/2 border-2 border-b-0 border-white/50" />
            <div className="absolute bottom-3 left-1/2 h-14 w-40 -translate-x-1/2 border-2 border-t-0 border-white/50" />
            <div className="absolute inset-0 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0_40px,transparent_40px_80px)]" />
          </div>
        </div>

        <span className="pointer-events-none absolute top-3 left-4 z-[1] font-display text-[10px] tracking-[0.3em] text-white/60">
          {FORMATION_LABEL[formation.format]} · {formation.name}
        </span>

        <div className="relative aspect-[3/4] w-full sm:aspect-[16/11]">
          {formation.slots.map((slot) => {
            const id = lineup[slot.key];
            const st = id ? stickers.find((s) => s.id === id) : undefined;
            return (
              <div
                key={slot.key}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 transition-[z-index]",
                  hoverSlot === slot.key ? "z-50" : "z-40",
                )}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                onMouseEnter={() => setHoverSlot(slot.key)}
                onMouseLeave={() => setHoverSlot((k) => (k === slot.key ? null : k))}
              >
                {st ? (
                  <div className="w-20 sm:w-28">
                    <div className="aspect-[2/3]">
                      <StickerCard
                        sticker={st}
                        compact
                        flat
                        detailsPosition="top-right"
                        onClick={() => openVersions(st)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => assignSlot(slot.key, null)}
                      className="mt-1 w-full rounded bg-black/60 py-[2px] font-display text-[9px] tracking-widest text-rose-300 hover:bg-rose-500/30"
                    >
                      SACAR
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPicker({ slot, playerId: null })}
                    className="group flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-dashed border-white/40 bg-black/30 font-display text-xs tracking-widest text-white/70 transition hover:scale-110 hover:border-amber-300 hover:text-amber-200 sm:h-20 sm:w-20"
                  >
                    <span className="text-lg">＋</span>
                    <span>{slot.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen del equipo */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-line bg-panel p-4">
          <h4 className="font-display text-lg tracking-widest text-ink">
            TU {FORMATION_LABEL[formation.format]} · {formation.name}
          </h4>
          {selected.length === 0 ? (
            <p className="mt-2 text-sm text-dim">
              Todavía no pusiste jugadores. Usá “EQUIPO AUTOMÁTICO” o tocá los puestos de la cancha.
            </p>
          ) : (
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {formation.slots.map((slot) => {
                const id = lineup[slot.key];
                const st = id ? stickers.find((s) => s.id === id) : undefined;
                if (!st) return null;
                return (
                  <li key={slot.key}>
                    <button
                      type="button"
                      onClick={() => openVersions(st)}
                      className="flex w-full items-center gap-2 rounded-lg bg-panel-2 px-2.5 py-1.5 text-left transition hover:bg-line-strong"
                    >
                      <span className="w-10 shrink-0 font-display text-[10px] tracking-widest text-amber-500">
                        {slot.label}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
                        {shortName(st.name)}
                      </span>
                      <span className="shrink-0 font-display text-[10px] text-faint">
                        {st.version.replace("VERSION ", "")}
                      </span>
                      <span className="shrink-0 font-display text-sm text-ink">{st.rating}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-panel p-4">
          <h4 className="font-display text-lg tracking-widest text-ink">DE TU ÁLBUM</h4>
          <p className="text-xs text-faint">
            Solo figuritas pegadas. Tocá una para ver sus versiones o abrir la carta.
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-5">
            {stickers
              .filter((s) => ownedSet.has(s.id) && s.stats)
              .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onDoubleClick={() => onOpenCard(s)}
                  onClick={() => openVersions(s)}
                  className="rounded-lg border border-line bg-panel-2 px-1 py-2 text-center transition hover:border-amber-400/60"
                  title="Click: versiones · Doble click: ver carta"
                >
                  <p className="font-display text-sm leading-none text-amber-500">{s.rating}</p>
                  <p className="truncate text-[9px] leading-tight text-ink">{shortName(s.name)}</p>
                  <p className="font-display text-[8px] tracking-widest text-faint">{s.pos}</p>
                </button>
              ))}
          </div>
        </div>
      </div>

      {picker && (
        <PlayerPicker
          slot={picker.slot}
          formation={formation}
          initialPlayerId={picker.playerId ?? null}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

const FORMATION_LABEL: Record<number, string> = {
  5: "FÚTBOL 5",
  7: "FÚTBOL 7",
  8: "FÚTBOL 8",
  11: "FÚTBOL 11",
};
