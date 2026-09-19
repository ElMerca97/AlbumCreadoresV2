import { useMemo, useState } from "react";
import { SECTIONS, stickers, type Sticker } from "@/data/stickers";
import { useAlbumStore, useAlbumStats, useOwnedSet } from "@/store/albumStore";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/utils/cn";
import StickerCard from "./StickerCard";

/** Splits de cada hoja del álbum: [izquierda, derecha, checklist] */
function pageLayout(version: string) {
  const list = stickers.filter((s) => s.version === version);
  if (list.length <= 9) return { left: list, right: [] as Sticker[], checklist: true };
  const cut = Math.ceil(list.length / 2);
  return { left: list.slice(0, cut), right: list.slice(cut), checklist: false };
}

/** Hueco vacío estilo Panini: papel brillante con el número impreso. */
function EmptySlot({ sticker, onClick }: { sticker: Sticker; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block h-full w-full focus:outline-none"
      title={`Figurita Nº ${sticker.id} · ${sticker.name}`}
    >
      <div className="slot-empty relative h-full w-full overflow-hidden rounded-[3px]">
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-1 text-center">
          <span className="font-display text-xl leading-none text-[#7a6337]/70 sm:text-2xl">
            {sticker.id}
          </span>
          <span className="mt-0.5 line-clamp-2 text-[7px] leading-tight font-semibold tracking-wide text-[#7a6337]/55 uppercase sm:text-[8px]">
            {sticker.type === "club" ? sticker.club : sticker.name}
          </span>
          <span className="mt-1 font-display text-[8px] tracking-[0.2em] text-[#7a6337]/45">
            {sticker.rarity}
          </span>
        </div>
        <span className="absolute inset-0 z-10 hidden items-center justify-center bg-black/25 font-display text-[10px] tracking-widest text-white group-hover:flex">
          VER INFO
        </span>
      </div>
    </button>
  );
}

/** Lista de control, como las páginas del final del álbum Panini. */
function Checklist({
  version,
  ownedSet,
  onOpen,
}: {
  version: string;
  ownedSet: Set<number>;
  onOpen: (s: Sticker) => void;
}) {
  const list = stickers.filter((s) => s.version === version);
  const got = list.filter((s) => ownedSet.has(s.id)).length;
  return (
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-[#7a6337]/25 pb-2">
        <p className="font-display text-[10px] tracking-[0.3em] text-[#7a6337]/70">
          LISTA DE CONTROL
        </p>
        <h4 className="font-display text-xl leading-none tracking-wide text-[#4a3a1c] sm:text-2xl">
          {version}
        </h4>
        <p className="mt-1 font-display text-xs tracking-widest text-[#7a6337]">
          {got}/{list.length} PEGADAS
        </p>
      </div>
      <ul className="mt-2 grid flex-1 grid-cols-1 gap-x-4 gap-y-1 overflow-y-auto pr-1 sm:grid-cols-2">
        {list.map((s) => {
          const has = ownedSet.has(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onOpen(s)}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1 text-left transition",
                  has ? "hover:bg-[#7a6337]/10" : "hover:bg-black/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-7 shrink-0 items-center justify-center rounded-sm border font-display text-[10px]",
                    has
                      ? "border-[#7a6337]/40 bg-[#7a6337]/15 text-[#4a3a1c]"
                      : "border-dashed border-[#7a6337]/30 text-[#7a6337]/45",
                  )}
                >
                  {s.id}
                </span>
                <span
                  className={cn(
                    "truncate text-[11px] font-semibold sm:text-xs",
                    has ? "text-[#4a3a1c]" : "text-[#7a6337]/50",
                  )}
                >
                  {s.name}
                </span>
                {s.pos && (
                  <span className="ml-auto font-display text-[9px] tracking-widest text-[#7a6337]/60">
                    {s.pos}
                  </span>
                )}
                {has && <span className="text-[10px] text-emerald-600">✓</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type Props = {
  onOpen: (s: Sticker) => void;
};

export default function AlbumView({ onOpen }: Props) {
  const ownedSet = useOwnedSet();
  const extras = useAlbumStore((s) => s.extras);
  const sellAllExtras = useAlbumStore((s) => s.sellAllExtras);
  const { dupesValue: extraTotal } = useAlbumStats();

  const albumView = useUIStore((s) => s.albumView);
  const setAlbumView = useUIStore((s) => s.setAlbumView);

  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");

  const spreads = SECTIONS;
  const total = spreads.length;
  const section = spreads[Math.min(page, total - 1)];
  const layout = useMemo(() => pageLayout(section.version), [section.version]);
  const key = `${section.version}-${page}`;

  const go = (dir: number) => setPage((p) => (p + dir + total) % total);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return stickers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.pos ?? "").toLowerCase().includes(q) ||
        String(s.id).includes(q),
    );
  }, [query]);

  // ─────────── VISTA CUADRÍCULA ───────────
  if (albumView === "grid") {
    return <GridAlbum ownedSet={ownedSet} extras={extras} onOpen={onOpen} />;
  }

  // ─────────── VISTA ÁLBUM PANINI ───────────
  return (
    <div className="space-y-6">
      {/* barra de navegación de páginas */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-panel p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel-2 text-ink transition hover:border-line-strong"
            aria-label="Hoja anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel-2 text-ink transition hover:border-line-strong"
            aria-label="Hoja siguiente"
          >
            ›
          </button>
        </div>

        <div className="flex flex-1 flex-wrap gap-1.5">
          {spreads.map((s, i) => (
            <button
              key={s.version}
              type="button"
              onClick={() => setPage(i)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 font-display text-[10px] tracking-[0.15em] transition sm:text-xs",
                i === page
                  ? "bg-amber-400 text-amber-950"
                  : "bg-panel-2 text-dim hover:text-ink",
              )}
            >
              {s.short}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar figurita…"
            className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-xs text-ink placeholder:text-faint focus:border-amber-400/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-faint hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAlbumView("grid")}
          className="rounded-lg border border-line px-3 py-2 font-display text-[10px] tracking-[0.15em] text-dim transition hover:border-line-strong hover:text-ink"
        >
          VISTA CUADRÍCULA
        </button>
      </div>

      {extraTotal > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
          <p className="text-sm text-amber-500">
            Tenés figuritas repetidas guardadas. Vendelas y sumá monedas para más sobres.
          </p>
          <button
            type="button"
            onClick={() => sellAllExtras()}
            className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 font-display text-sm tracking-widest text-amber-950 transition hover:brightness-110 active:scale-95"
          >
            VENDER TODAS · +{extraTotal} 🪙
          </button>
        </div>
      )}

      {/* Búsqueda activa */}
      {searchResults ? (
        <div className="rounded-3xl border border-line bg-panel p-4 sm:p-6">
          <h3 className="font-display text-2xl tracking-wide text-ink">
            {searchResults.length} RESULTADO{searchResults.length === 1 ? "" : "S"}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {searchResults.map((s) => (
              <div key={s.id} className="relative z-10 aspect-[2/3]">
                <StickerCard
                  sticker={s}
                  locked={!ownedSet.has(s.id)}
                  extra={extras[s.id] ?? 0}
                  onClick={() => onOpen(s)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── HOJA DOBLE DEL ÁLBUM ── */
        <div className="relative">
          <div key={key} className="animate-page-in grid gap-0 md:grid-cols-2">
            {/* PÁGINA IZQUIERDA */}
            <div className="album-sheet rounded-2xl p-3 sm:p-5 md:rounded-r-none">
              <header className="relative z-10 mb-3">
                <p className="font-display text-[9px] tracking-[0.35em] text-[#7a6337]/70">
                  MALDONADOCARDS · ÁLBUM OFICIAL
                </p>
                <h3 className="font-display text-2xl leading-none tracking-wide text-[#4a3a1c] sm:text-4xl">
                  {section.version}
                </h3>
                <p className="mt-1 text-[11px] text-[#7a6337] italic sm:text-xs">{section.blurb}</p>
                <SectionProgress version={section.version} ownedSet={ownedSet} />
              </header>

              <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2.5">
                {layout.left.map((s) =>
                  ownedSet.has(s.id) ? (
                    <div
                      key={s.id}
                      className="stuck relative z-10 aspect-[2/3]"
                      style={{ transform: `rotate(${((s.id % 5) - 2) * 0.6}deg)` }}
                    >
                      <StickerCard sticker={s} flat onClick={() => onOpen(s)} />
                    </div>
                  ) : (
                    <div key={s.id} className="relative z-10 aspect-[2/3]">
                      <EmptySlot sticker={s} onClick={() => onOpen(s)} />
                    </div>
                  ),
                )}
              </div>

              <footer className="relative z-10 mt-3 flex items-center justify-between font-display text-[9px] tracking-[0.25em] text-[#7a6337]/60">
                <span>MALDONADO SIEMPRE CREA</span>
                <span>PÁGINA {page * 2 + 1}</span>
              </footer>
            </div>

            {/* PÁGINA DERECHA */}
            <div className="album-sheet rounded-2xl p-3 sm:p-5 md:rounded-l-none">
              {layout.right.length > 0 ? (
                <>
                  <header className="relative z-10 mb-3 flex items-end justify-between border-b-2 border-[#7a6337]/25 pb-2">
                    <h4 className="font-display text-xl leading-none tracking-wide text-[#4a3a1c] sm:text-3xl">
                      {section.short}
                    </h4>
                    <span className="font-display text-[9px] tracking-[0.25em] text-[#7a6337]/60">
                      CONTINUACIÓN
                    </span>
                  </header>
                  <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2.5">
                    {layout.right.map((s) =>
                      ownedSet.has(s.id) ? (
                        <div
                          key={s.id}
                          className="stuck relative z-10 aspect-[2/3]"
                          style={{ transform: `rotate(${((s.id % 7) - 3) * 0.6}deg)` }}
                        >
                          <StickerCard sticker={s} flat onClick={() => onOpen(s)} />
                        </div>
                      ) : (
                        <div key={s.id} className="relative z-10 aspect-[2/3]">
                          <EmptySlot sticker={s} onClick={() => onOpen(s)} />
                        </div>
                      ),
                    )}
                  </div>
                  <div className="relative z-10 mt-3">
                    <MiniStats version={section.version} ownedSet={ownedSet} />
                  </div>
                </>
              ) : (
                <div className="relative z-10 h-full">
                  <Checklist version={section.version} ownedSet={ownedSet} onOpen={onOpen} />
                </div>
              )}
              <footer className="relative z-10 mt-3 flex items-center justify-between font-display text-[9px] tracking-[0.25em] text-[#7a6337]/60">
                <span>EDICIÓN 2026</span>
                <span>PÁGINA {page * 2 + 2}</span>
              </footer>
            </div>
          </div>

          {/* lomo central */}
          <div
            className="album-spine pointer-events-none absolute inset-y-0 left-1/2 hidden w-3 -translate-x-1/2 md:block"
            aria-hidden
          />

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Colección anterior"
            className="absolute top-1/2 left-2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#7a6337]/35 bg-[#fffdf3]/90 font-display text-2xl text-[#4a3a1c] shadow-lg transition hover:scale-110 hover:bg-amber-300 md:-left-5 md:h-12 md:w-12"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Siguiente colección"
            className="absolute top-1/2 right-2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#7a6337]/35 bg-[#fffdf3]/90 font-display text-2xl text-[#4a3a1c] shadow-lg transition hover:scale-110 hover:bg-amber-300 md:-right-5 md:h-12 md:w-12"
          >
            ›
          </button>

          {/* paginado inferior */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {spreads.map((s, i) => (
              <button
                key={s.version}
                type="button"
                onClick={() => setPage(i)}
                aria-label={s.version}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === page ? "w-8 bg-amber-400" : "w-3 bg-panel-2 hover:bg-line-strong",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionProgress({
  version,
  ownedSet,
}: {
  version: string;
  ownedSet: Set<number>;
}) {
  const list = stickers.filter((s) => s.version === version);
  const got = list.filter((s) => ownedSet.has(s.id)).length;
  const pct = Math.round((got / list.length) * 100);
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#7a6337]/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-display text-xs tracking-widest text-[#4a3a1c]">
        {got}/{list.length}
      </span>
    </div>
  );
}

function MiniStats({
  version,
  ownedSet,
}: {
  version: string;
  ownedSet: Set<number>;
}) {
  const list = stickers.filter((s) => s.version === version);
  const got = list.filter((s) => ownedSet.has(s.id)).length;
  const best = [...list]
    .filter((s) => ownedSet.has(s.id) && s.rating)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#7a6337]/25 bg-white/40 p-2 text-center">
      <div>
        <p className="font-display text-[8px] tracking-[0.2em] text-[#7a6337]/70">PEGADAS</p>
        <p className="font-display text-lg leading-none text-[#4a3a1c]">
          {got}/{list.length}
        </p>
      </div>
      <div>
        <p className="font-display text-[8px] tracking-[0.2em] text-[#7a6337]/70">FALTAN</p>
        <p className="font-display text-lg leading-none text-[#4a3a1c]">{list.length - got}</p>
      </div>
      <div>
        <p className="font-display text-[8px] tracking-[0.2em] text-[#7a6337]/70">MEJOR MEDIA</p>
        <p className="font-display text-lg leading-none text-[#4a3a1c]">
          {best?.rating ?? "--"}
        </p>
      </div>
    </div>
  );
}

/* ─────────────── VISTA CUADRÍCULA (todas las cartas) ─────────────── */
function GridAlbum({
  ownedSet,
  extras,
  onOpen,
}: {
  ownedSet: Set<number>;
  extras: Record<string, number>;
  onOpen: (s: Sticker) => void;
}) {
  const setAlbumView = useUIStore((s) => s.setAlbumView);
  const [mode, setMode] = useState<"todas" | "tengo" | "faltan">("todas");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"album" | "rating" | "nombre">("album");

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SECTIONS.map((sec) => {
      let list = stickers.filter((s) => s.version === sec.version);
      if (q)
        list = list.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.pos ?? "").toLowerCase().includes(q) ||
            String(s.id).includes(q),
        );
      if (mode === "tengo") list = list.filter((s) => ownedSet.has(s.id));
      if (mode === "faltan") list = list.filter((s) => !ownedSet.has(s.id));
      if (sort === "rating") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      if (sort === "nombre") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      return { ...sec, list };
    }).filter((sec) => sec.list.length > 0);
  }, [mode, query, sort, ownedSet]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-3 lg:flex-row lg:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar jugador, posición o número…"
          className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-amber-400/60 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "todas", label: "TODAS" },
              { id: "tengo", label: "LAS QUE TENGO" },
              { id: "faltan", label: "ME FALTAN" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "rounded-lg px-3 py-2 font-display text-[10px] tracking-widest transition",
                mode === m.id ? "bg-amber-400 text-amber-950" : "bg-panel-2 text-dim hover:text-ink",
              )}
            >
              {m.label}
            </button>
          ))}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-line bg-panel px-2 py-2 text-xs text-ink focus:outline-none"
          >
            <option value="album">ORDEN DEL ÁLBUM</option>
            <option value="rating">MEJOR RATING</option>
            <option value="nombre">A-Z</option>
          </select>
          <button
            type="button"
            onClick={() => setAlbumView("panini")}
            className="rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-2 font-display text-[10px] tracking-widest text-amber-950 transition hover:brightness-110"
          >
            VISTA ÁLBUM PANINI
          </button>
        </div>
      </div>

      {sections.length === 0 && (
        <p className="py-16 text-center text-dim">No hay figuritas con esos filtros.</p>
      )}

      {sections.map((sec, i) => {
        const total = stickers.filter((s) => s.version === sec.version).length;
        const got = stickers.filter(
          (s) => s.version === sec.version && ownedSet.has(s.id),
        ).length;
        const pct = Math.round((got / total) * 100);
        return (
          <section
            key={sec.version}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-2">
              <div>
                <h3 className="font-display text-2xl tracking-wide text-ink sm:text-3xl">
                  {sec.version}
                </h3>
                <p className="text-xs text-faint">{sec.blurb}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-sm tracking-widest text-dim">
                  {got}/{total}
                </span>
                <div className="h-2 w-28 overflow-hidden rounded-full bg-panel-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-display text-lg text-emerald-400">{pct}%</span>
              </div>
            </div>

            {/* las cartas ocupan todo el espacio de su celda */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {sec.list.map((s) => (
                <div key={s.id} className="relative z-10 aspect-[2/3]">
                  <StickerCard
                    sticker={s}
                    locked={!ownedSet.has(s.id)}
                    extra={extras[s.id] ?? 0}
                    onClick={() => onOpen(s)}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
