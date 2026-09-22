import { useMemo, useState } from "react";
import { CANCHA_LIFFA, stickers, type Rarity, type Sticker } from "@/data/stickers";
import { imageUrl } from "@/lib/images";
import { useAlbumStore, useOwnedSet } from "@/store/albumStore";
import { cn } from "@/utils/cn";
import StickerCard from "./StickerCard";
import CoinIcon from "./CoinIcon";

type Weight = { rarity: Rarity; w: number };

type PackDef = {
  id: string;
  name: string;
  tag: string;
  cost: number;
  count: number;
  guarantee: Rarity[];
  filler: Weight[];
  accent: string;
  image: string;
  effect?: "flash";
};

// Archivo de referencia de los sobres originales. La tienda usa los dos sobres unificados.
export const LEGACY_PACKS = [
  {
    id: "comun",
    name: "Sobre Común",
    tag: "PARA ARRANCAR EL ÁLBUM",
    cost: 100,
    count: 4,
    guarantee: [],
    filler: [
      { rarity: "COMÚN", w: 0.86 },
      { rarity: "ESCUDO", w: 0.14 },
    ],
    accent: "from-slate-300 via-white to-slate-400",
    glow: "shadow-[0_18px_50px_-18px_rgba(203,213,225,0.8)]",
    icon: "⚽",
  },
  {
    id: "epico",
    name: "Sobre Épico",
    tag: "1 ÉPICA GARANTIZADA",
    cost: 300,
    count: 4,
    guarantee: ["ÉPICO"],
    filler: [
      { rarity: "COMÚN", w: 0.7 },
      { rarity: "ÉPICO", w: 0.2 },
      { rarity: "ESCUDO", w: 0.1 },
    ],
    accent: "from-violet-500 via-fuchsia-600 to-indigo-700",
    glow: "shadow-[0_18px_50px_-18px_rgba(168,85,247,0.9)]",
    icon: "⚡",
  },
  {
    id: "escudos",
    name: "Sobre Escudos",
    tag: "3 ESCUDOS DE CLUBES",
    cost: 220,
    count: 3,
    guarantee: ["ESCUDO"],
    filler: [{ rarity: "ESCUDO", w: 1 }],
    accent: "from-sky-400 via-blue-600 to-indigo-800",
    glow: "shadow-[0_18px_50px_-18px_rgba(59,130,246,0.9)]",
    icon: "🛡️",
  },
  {
    id: "retro",
    name: "Sobre Retro 80's",
    tag: "1 CARTA 80'S GARANTIZADA",
    cost: 500,
    count: 4,
    guarantee: ["80'S"],
    filler: [
      { rarity: "COMÚN", w: 0.5 },
      { rarity: "ÉPICO", w: 0.35 },
      { rarity: "ESCUDO", w: 0.15 },
    ],
    accent: "from-amber-400 via-orange-500 to-rose-600",
    glow: "shadow-[0_18px_50px_-18px_rgba(249,115,22,0.9)]",
    icon: "📼",
  },
  {
    id: "dios",
    name: "Sobre Modo Dios",
    tag: "1 MODO DIOS GARANTIZADA",
    cost: 900,
    count: 3,
    guarantee: ["MODO DIOS"],
    filler: [
      { rarity: "ÉPICO", w: 0.5 },
      { rarity: "80'S", w: 0.3 },
      { rarity: "COMÚN", w: 0.2 },
    ],
    accent: "from-yellow-200 via-amber-400 to-yellow-600",
    glow: "shadow-[0_18px_55px_-16px_rgba(250,204,21,0.95)]",
    icon: "👑",
  },
  {
    id: "alternativa",
    name: "Sobre Alternativa",
    tag: "1 ALTERNATIVA GARANTIZADA",
    cost: 1400,
    count: 2,
    guarantee: ["ALTERNATIVA"],
    filler: [
      { rarity: "MODO DIOS", w: 0.6 },
      { rarity: "80'S", w: 0.4 },
    ],
    accent: "from-cyan-300 via-teal-400 to-fuchsia-600",
    glow: "shadow-[0_18px_55px_-16px_rgba(45,212,191,0.95)]",
    icon: "🌀",
  },
  {
    id: "mega",
    name: "Mega Sobre Creador",
    tag: "6 CARTAS · TODO GARANTIZADO",
    cost: 2000,
    count: 6,
    guarantee: ["MODO DIOS", "ALTERNATIVA", "80'S", "ÉPICO"],
    filler: [
      { rarity: "MODO DIOS", w: 0.4 },
      { rarity: "80'S", w: 0.3 },
      { rarity: "ÉPICO", w: 0.3 },
    ],
    accent: "from-emerald-300 via-amber-300 to-fuchsia-500",
    glow: "shadow-[0_22px_60px_-14px_rgba(255,255,255,0.65)]",
    icon: "🏆",
  },
];

export const PACKS: PackDef[] = [
  {
    id: "plata",
    name: "Sobre de Plata",
    tag: "3 CROMOS · PROMEDIO CLÁSICO",
    cost: 220,
    count: 3,
    guarantee: [],
    filler: [
      // Promedio simple de Común, Épico y Escudos.
      { rarity: "COMÚN", w: 0.4616667 },
      { rarity: "ÉPICO", w: 0.1333333 },
      { rarity: "ESCUDO", w: 0.405 },
    ],
    accent: "from-slate-300 via-white to-slate-400",
    image: "images/otros/SobrePlataCreadores.png",
  },
  {
    id: "oro",
    name: "Sobre de Oro",
    tag: "5 CROMOS · PROMEDIO PREMIUM",
    cost: 1200,
    count: 5,
    guarantee: [],
    filler: [
      // Promedio simple de Retro, Modo Dios, Alternativa y Mega Sobre.
      { rarity: "COMÚN", w: 0.1270833 },
      { rarity: "ÉPICO", w: 0.215625 },
      { rarity: "ESCUDO", w: 0.028125 },
      { rarity: "80'S", w: 0.2291667 },
      { rarity: "MODO DIOS", w: 0.2333333 },
      { rarity: "ALTERNATIVA", w: 0.1666667 },
    ],
    accent: "from-amber-200 via-yellow-400 to-orange-600",
    image: "images/otros/SobreDoradoCreadores.png",
  },
  {
    id: "creadores",
    name: "Sobre Creadores",
    tag: "7 CROMOS · FLASH EXCLUSIVO",
    cost: 1900,
    count: 7,
    guarantee: [],
    filler: [
      // Un paso por encima de Oro: más rarezas altas, sin un salto exagerado.
      { rarity: "COMÚN", w: 0.08 },
      { rarity: "ÉPICO", w: 0.22 },
      { rarity: "ESCUDO", w: 0.02 },
      { rarity: "80'S", w: 0.24 },
      { rarity: "MODO DIOS", w: 0.25 },
      { rarity: "ALTERNATIVA", w: 0.19 },
    ],
    accent: "from-violet-300 via-fuchsia-400 to-amber-300",
    image: "images/otros/SobreDoradoCreadores.png",
    effect: "flash",
  },
];

const poolOf = (r: Rarity) => stickers.filter((s) => s.rarity === r);

function pickWeighted(filler: Weight[]): Rarity {
  const r = Math.random();
  let acc = 0;
  for (const f of filler) {
    acc += f.w;
    if (r <= acc) return f.rarity;
  }
  return filler[filler.length - 1].rarity;
}

function drawFrom(rarity: Rarity, owned: Set<number>): Sticker {
  const pool = poolOf(rarity);
  if (pool.length === 0) return stickers[0];
  const missing = pool.filter((s) => !owned.has(s.id));
  // 65% de priorizar figuritas que faltan (cuando hay disponibles)
  if (missing.length > 0 && Math.random() < 0.65) {
    return missing[Math.floor(Math.random() * missing.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Probabilidades por rareza dentro de un sobre (para mostrar en la tienda). */
const RARITY_ORDER: Rarity[] = [
  "MODO DIOS",
  "ALTERNATIVA",
  "80'S",
  "ÉPICO",
  "ESCUDO",
  "COMÚN",
];

function packOdds(p: PackDef): string {
  const counts = new Map<Rarity, number>();
  for (const g of p.guarantee) counts.set(g, (counts.get(g) ?? 0) + 1);
  const rest = Math.max(0, p.count - p.guarantee.length);
  for (const f of p.filler) {
    counts.set(f.rarity, (counts.get(f.rarity) ?? 0) + f.w * rest);
  }
  return RARITY_ORDER.filter((r) => (counts.get(r) ?? 0) > 0.05)
    .map((r) => `${r} ${Math.round(((counts.get(r) ?? 0) / p.count) * 100)}%`)
    .join(" · ");
}

/**
 * Probabilidad independiente de obtener un cromo especial de cancha (Cancha Liffa)
 * por sobre abierto. No afecta las probabilidades normales de cada rareza.
 */
const COURT_PACK_CHANCE: Record<string, number> = {
  plata: 0.05,
  oro: 0.07,
  creadores: 0.1,
};

function drawPack(pack: PackDef, owned: Set<number>): Sticker[] {
  const out: Sticker[] = [];
  for (const g of pack.guarantee) out.push(drawFrom(g, owned));
  while (out.length < pack.count) {
    const rarity = pickWeighted(pack.filler);
    const card = drawFrom(rarity, owned);
    if (out.filter((c) => c.id === card.id).length >= 2) continue;
    out.push(card);
  }

  // Cancha Liffa entra como posibilidad independiente, reemplazando como máximo
  // UNA carta NO garantizada (nunca agrega cromos ni rompe garantías).
  const chance = COURT_PACK_CHANCE[pack.id] ?? 0;
  if (chance > 0 && !out.some((c) => c.type === "court") && Math.random() < chance) {
    const free = out.map((_, i) => i).filter((i) => i >= pack.guarantee.length);
    if (free.length > 0) {
      out[free[Math.floor(Math.random() * free.length)]] = CANCHA_LIFFA;
    }
  }

  return out;
}

function CardBack({ pack }: { pack: PackDef }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <img
        src={imageUrl(pack.image)}
        alt={pack.name}
        className="h-full w-full object-cover"
      />
      <div className="hidden relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[9px] bg-[#0a0f1c]">
        <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(135deg,rgba(255,255,255,.14)_0_8px,transparent_8px_16px)]" />
        <div className={cn("absolute -inset-6 bg-gradient-to-br opacity-25 blur-2xl", pack.accent)} />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-300/70 bg-black/50">
          <span className="font-display text-2xl tracking-tight text-amber-300">MC</span>
        </div>
        <span className="relative mt-3 font-display text-[10px] tracking-[0.3em] text-amber-200/80">
          MALDONADO
        </span>
      </div>
    </div>
  );
}

type Props = {
  onOpenCard: (s: Sticker) => void;
};

export default function PacksView({ onOpenCard }: Props) {
  const coins = useAlbumStore((s) => s.coins);
  const ownedSet = useOwnedSet();
  const onSpend = useAlbumStore((s) => s.addCoins);
  const onAdd = useAlbumStore((s) => s.addStickers);
  const onPacks = useAlbumStore((s) => s.registerPacks);

  const [phase, setPhase] = useState<"shop" | "shaking" | "reveal" | "saved">("shop");
  const [pack, setPack] = useState<PackDef | null>(null);
  const [pulled, setPulled] = useState<{ sticker: Sticker; isNew: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [reward, setReward] = useState<{ fresh: number[]; gained: number } | null>(null);

  const canAfford = (p: PackDef) => coins >= p.cost;
  const allFlipped = pulled.length > 0 && flipped.length === pulled.length;

  const openPack = (p: PackDef) => {
    if (!canAfford(p)) return;
    onSpend(-p.cost);
    const cards = drawPack(p, ownedSet);
    setPack(p);
    setPulled(cards.map((sticker) => ({ sticker, isNew: !ownedSet.has(sticker.id) })));
    setFlipped([]);
    setReward(null);
    setPhase("shaking");
    window.setTimeout(() => setPhase("reveal"), 950);
  };

  const save = () => {
    if (!pack) return;
    const res = onAdd(pulled.map((p) => p.sticker.id));
    onPacks(1);
    setReward(res);
    setPhase("saved");
  };

  const close = () => {
    setPhase("shop");
    setPack(null);
    setPulled([]);
    setFlipped([]);
    setReward(null);
  };

  const flipOne = (i: number) =>
    setFlipped((f) => (f.includes(i) ? f : [...f, i]));

  const odds = useMemo(
    () => new Map(PACKS.map((p) => [p.id, packOdds(p)])),
    [],
  );

  if (phase !== "shop") {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-line bg-veil p-5 sm:p-8">
        <div className={cn("pointer-events-none absolute -top-40 left-1/2 z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br opacity-25 blur-3xl", pack?.accent)} />

        {phase === "shaking" && (
          <div className="relative z-10 flex flex-col items-center justify-center py-20">
            <div className={cn("animate-shake relative", pack?.effect === "flash" && "animate-photo-flash")}>
              <div className="w-40 sm:w-52">
                <div className="aspect-[2/3]">
                  <CardBack pack={pack!} />
                </div>
              </div>
            </div>
            <p className="mt-8 font-display text-2xl tracking-[0.2em] text-amber-300">
              ABIENDO EL SOBRE…
            </p>
          </div>
        )}

        {(phase === "reveal" || phase === "saved") && (
          <div className="relative z-10">
            <div className="text-center">
              <h3 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
                {pack?.name}
              </h3>
              <p className="mt-1 text-xs tracking-[0.2em] text-dim">
                {phase === "saved"
                  ? "FIGURITAS GUARDADAS EN TU ÁLBUM"
                  : allFlipped
                    ? "¡TODO REVELADO! GUARDALAS EN EL ÁLBUM"
                    : "TOCÁ CADA CARTA PARA DARLA VUELTA"}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {pulled.map((p, i) => {
                const isFlipped = flipped.includes(i);
                const best = p.sticker.rarity === "MODO DIOS" || p.sticker.rarity === "ALTERNATIVA";
                return (
                  <div
                    key={`${p.sticker.id}-${i}`}
                    className={cn("flip aspect-[2/3] cursor-pointer", isFlipped && "is-flipped")}
                    onClick={() => flipOne(i)}
                  >
                    <div className="flip-inner">
                      <div className="flip-face">
                        <CardBack pack={pack!} />
                      </div>
                      <div className="flip-face flip-back">
                        <div
                          className={cn(
                            "h-full w-full",
                            best && isFlipped && "animate-glow rounded-xl",
                          )}
                        >
                          <StickerCard
                            sticker={p.sticker}
                            isNew={isFlipped && p.isNew}
                            compact
                            onClick={() => onOpenCard(p.sticker)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {reward && (
              <div className="animate-fade-up mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                  <p className="font-display text-xl tracking-widest text-emerald-300">
                    {reward.fresh.length} FIGURITA{reward.fresh.length === 1 ? "" : "S"} NUEVA
                    {reward.fresh.length === 1 ? "" : "S"}
                  </p>
                  <p className="mt-1 text-sm text-emerald-100/80">
                    Ya están pegadas en tu álbum.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                  <p className="font-display text-xl tracking-widest text-amber-300">
                    +{reward.gained} <CoinIcon /> EN REPETIDAS
                  </p>
                  <p className="mt-1 text-sm text-amber-100/80">
                    Las repetidas se guardan para vender cuando quieras.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!allFlipped && (
                <button
                  type="button"
                  onClick={() => setFlipped(pulled.map((_, i) => i))}
                  className="rounded-xl bg-panel-2 px-5 py-3 font-display tracking-widest text-ink transition hover:bg-line-strong"
                >
                  REVELAR TODO
                </button>
              )}
              {allFlipped && phase === "reveal" && (
                <button
                  type="button"
                  onClick={save}
                  className="rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 px-6 py-3 font-display text-lg tracking-widest text-emerald-950 transition hover:brightness-110 active:scale-95"
                >
                  GUARDAR EN EL ÁLBUM
                </button>
              )}
              {phase === "saved" && (
                <>
                  <button
                    type="button"
                    onClick={() => pack && canAfford(pack) && openPack(pack)}
                    disabled={!pack || !canAfford(pack)}
                    className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-3 font-display tracking-widest text-amber-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ABRIR OTRO · {pack?.cost} <CoinIcon />
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-xl bg-panel-2 px-5 py-3 font-display tracking-widest text-ink transition hover:bg-line-strong"
                  >
                    VOLVER A LA TIENDA
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tienda */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PACKS.map((p, i) => (
          <div
            key={p.id}
            className="animate-fade-up group relative overflow-hidden rounded-2xl border border-line bg-panel p-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className={cn(
                "pointer-events-none absolute -top-24 -right-16 z-0 h-56 w-56 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition group-hover:opacity-40",
                p.accent,
              )}
            />
            <div className="relative z-10 flex gap-4">
              <div className="w-24 shrink-0 sm:w-28">
                <div className="animate-floaty">
                  <div className="aspect-[2/3]">
                    <CardBack pack={p} />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-2xl leading-none tracking-wide text-ink">
                  {p.name}
                </h4>
                <p className="mt-1 font-display text-[10px] tracking-[0.2em] text-amber-300">
                  {p.tag}
                </p>
                <p className="mt-2 text-xs text-dim">
                  {p.count} figuritas · {odds.get(p.id)}
                </p>
                <button
                  type="button"
                  onClick={() => openPack(p)}
                  disabled={!canAfford(p)}
                  className={cn(
                    "mt-3 w-full rounded-xl px-4 py-2.5 font-display tracking-widest transition active:scale-95",
                    canAfford(p)
                      ? cn("bg-gradient-to-r text-black hover:brightness-110", p.accent)
                      : "cursor-not-allowed bg-panel-2 text-faint",
                  )}
                >
                  {canAfford(p) ? (
              <>
                ABRIR · {p.cost} <CoinIcon />
              </>
            ) : (
              <>FALTAN {p.cost - coins} <CoinIcon /></>
            )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-faint">
        Probabilidades informativas. Las repetidas se pueden vender por 5-15{" "}
        <CoinIcon /> por repetida.
      </p>
    </div>
  );
}
