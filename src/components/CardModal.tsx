import { useEffect } from "react";
import type { Sticker } from "@/data/stickers";
import { STAT_KEYS } from "@/data/stickers";
import { rarityTheme, statColor } from "@/lib/rarity";
import { useAlbumStore } from "@/store/albumStore";
import { cn } from "@/utils/cn";
import CoinIcon from "./CoinIcon";
import StickerCard from "./StickerCard";

type Props = {
  sticker: Sticker;
  onClose: () => void;
};

export default function CardModal({ sticker, onClose }: Props) {
  const t = rarityTheme(sticker);
  const owned = useAlbumStore((s) => s.owned.includes(sticker.id));
  const extra = useAlbumStore((s) => s.extras[sticker.id] ?? 0);
  const sellExtra = useAlbumStore((s) => s.sellExtra);
  const onSell = () => sellExtra(sticker.id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-pop relative my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-line bg-page-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-panel-2 text-ink transition hover:bg-line-strong"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[280px_1fr]">
          <div className="mx-auto w-52 sm:w-64 md:w-full md:max-w-sm">
            <div className="aspect-[2/3]">
              <StickerCard sticker={sticker} locked={!owned} extra={extra} />
            </div>
          </div>

          <div className="flex flex-col">
            <span
              className={cn(
                "w-fit rounded-full px-3 py-1 font-display text-xs tracking-[0.25em]",
                t.badge,
              )}
            >
              {sticker.type === "court" ? "CANCHA" : sticker.version}
            </span>
            <h2 className="mt-3 font-display text-3xl leading-none tracking-wide text-ink sm:text-4xl">
              {sticker.name}
            </h2>
            <p className="mt-1 text-sm text-dim">
              {sticker.type === "club"
                ? sticker.club
                : sticker.type === "court"
                  ? `Cancha · Especial · Nº ${sticker.id}`
                  : `${sticker.team} · ${sticker.pos} · Nº ${sticker.number}`}
            </p>

            <p className="mt-4 border-l-2 border-amber-400/70 pl-3 text-sm italic text-dim">
              “{sticker.quote}”
            </p>

            {sticker.stats ? (
              <div className="mt-6 space-y-2.5">
                {STAT_KEYS.map((k) => {
                  const v = sticker.stats![k];
                  return (
                    <div key={k} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 font-display text-sm tracking-widest text-dim">
                        {k.toUpperCase()}
                      </span>
                      <span className="w-8 shrink-0 font-display text-lg text-ink">{v}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-panel-2">
                        <div
                          className={cn("h-full rounded-full bg-gradient-to-r", statColor(v))}
                          style={{ width: `${Math.min(100, v)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 pt-1">
                  <span className="w-20 shrink-0 font-display text-sm tracking-widest text-amber-300">
                    OVERALL
                  </span>
                  <span className="w-8 shrink-0 font-display text-lg text-amber-300">
                    {sticker.rating}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200"
                      style={{ width: `${Math.min(100, sticker.rating ?? 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p
                className={cn(
                  "text-dim",
                  sticker.type === "court"
                    ? "mt-7 max-w-prose text-base leading-relaxed sm:text-lg"
                    : "mt-6 text-sm",
                )}
              >
                {sticker.type === "court"
                  ? "Aquí se entrenan y se forjan las historias de la Selección de Creadores. Canchas de calidad, un equipo humano excepcional y una cantina que forma parte de la experiencia. Un lugar legendario donde cada partido, oficial o amistoso, se convierte en un recuerdo."
                  : "Figurita especial de club: no tiene estadísticas, pero vale igual que una leyenda para completar el álbum."}
              </p>
            )}

            <div className="mt-auto flex flex-wrap gap-3 pt-7">
              <p
                className={cn(
                  "flex-1 rounded-xl px-4 py-3 text-center font-display text-sm tracking-widest",
                  owned ? "bg-emerald-400/15 text-emerald-400" : "bg-panel-2 text-faint",
                )}
              >
                {owned ? "YA ESTÁ EN TU ÁLBUM" : "CONSEGUÍLA EN UN SOBRE"}
              </p>
              {extra > 0 && (
                <button
                  type="button"
                  onClick={onSell}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-3 font-display text-base tracking-widest text-amber-950 transition hover:brightness-110 active:scale-95"
                >
                  VENDER REPETIDA · 5-15 <CoinIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
