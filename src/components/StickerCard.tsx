import type { Sticker } from "@/data/stickers";
import { useStickerImage } from "@/lib/images";
import { cn } from "@/utils/cn";

type Props = {
  sticker: Sticker;
  locked?: boolean;
  extra?: number;
  isNew?: boolean;
  onClick?: () => void;
  className?: string;
  /** Conservado por compatibilidad con las vistas que usan este componente. */
  compact?: boolean;
  /** Conservado por compatibilidad con las vistas que usan este componente. */
  flat?: boolean;
  detailsPosition?: "bottom-left" | "top-right";
};

/**
 * La imagen de cada figurita ya contiene el cromo terminado. Por eso esta vista
 * no construye una segunda carta alrededor: muestra la ilustración completa y
 * sólo suma la valoración/posición como referencia rápida.
 */
export default function StickerCard({
  sticker,
  locked = false,
  extra = 0,
  isNew = false,
  onClick,
  className,
  detailsPosition = "bottom-left",
}: Props) {
  const image = useStickerImage(sticker.image);
  const isClub = sticker.type === "club";
  const hasDetails = !isClub && sticker.rating != null && sticker.pos;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={locked ? `Figurita ${sticker.id}, bloqueada` : `Ver ${sticker.name}`}
      className={cn(
        "group relative block h-full w-full overflow-hidden rounded-[3px] text-left",
        "bg-slate-200 shadow-[0_5px_14px_-8px_rgba(0,0,0,0.7)] transition-transform duration-300",
        "hover:-translate-y-1 hover:shadow-[0_12px_22px_-10px_rgba(0,0,0,0.75)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
        className,
      )}
    >
      {!locked && image.status === "ok" && image.src ? (
        <img
          src={image.src}
          alt={sticker.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400 px-2 text-center">
          <div className="absolute inset-0 opacity-20 [background:repeating-linear-gradient(45deg,rgba(255,255,255,.8)_0_10px,transparent_10px_20px)]" />
          <span className="relative font-display text-4xl text-slate-600/40">{locked ? "?" : "…"}</span>
          <span className="relative mt-1 font-display text-[8px] tracking-[0.16em] text-slate-600/70">
            {locked ? "FALTA" : "CARGANDO"}
          </span>
        </div>
      )}

      {hasDetails && !locked && (
        <span
          className={cn(
            "absolute flex h-8 w-8 flex-col items-center justify-center rounded-full border border-white/80 bg-slate-950/85 text-white shadow-lg backdrop-blur-sm sm:h-10 sm:w-10",
            detailsPosition === "top-right"
              ? "top-1.5 right-1.5 sm:top-2 sm:right-2"
              : "bottom-1.5 left-1.5 sm:bottom-2 sm:left-2",
          )}
        >
          <span className="font-display text-[12px] leading-none sm:text-base">{sticker.rating}</span>
          <span className="mt-0.5 font-display text-[6px] leading-none tracking-[0.12em] text-amber-300 sm:text-[7px]">
            {sticker.pos}
          </span>
        </span>
      )}

      {isNew && (
        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-1.5 py-0.5 font-display text-[8px] tracking-[0.12em] text-emerald-950 shadow-lg sm:text-[9px]">
          ¡NUEVA!
        </span>
      )}
      {extra > 0 && (
        <span className="absolute right-1.5 bottom-1.5 rounded-full bg-black/75 px-1.5 py-0.5 font-display text-[8px] tracking-widest text-amber-300 shadow-md sm:right-2 sm:bottom-2 sm:text-[9px]">
          ×{extra + 1}
        </span>
      )}
    </button>
  );
}
