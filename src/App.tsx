import { useState } from "react";
import cover from "@/assets/cover.jpg";
import AlbumView from "@/components/AlbumView";
import CardModal from "@/components/CardModal";
import CodeModal from "@/components/CodeModal";
import ImageChecker from "@/components/ImageChecker";
import LeagueView from "@/components/LeagueView";
import LineupView from "@/components/LineupView";
import PacksView from "@/components/PacksView";
import ThemeToggle from "@/components/ThemeToggle";
import { CODES } from "@/data/codes";
import { SECTIONS, stickers, type Sticker } from "@/data/stickers";
import { useAlbumStats, useAlbumStore, useOwnedSet } from "@/store/albumStore";
import { useThemeEffect, useUIStore } from "@/store/uiStore";
import { cn } from "@/utils/cn";

type Tab = "album" | "sobres" | "once" | "liga";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "album", label: "EL ÁLBUM", icon: "📕" },
  { id: "sobres", label: "SOBRES", icon: "🎁" },
  { id: "once", label: "MI EQUIPO", icon: "🧢" },
  { id: "liga", label: "LIGA", icon: "🏆" },
];

export default function App() {
  useThemeEffect();

  const coins = useAlbumStore((s) => s.coins);
  const packsOpened = useAlbumStore((s) => s.packsOpened);
  const redeemed = useAlbumStore((s) => s.redeemed);
  const reset = useAlbumStore((s) => s.reset);
  const ownedSet = useOwnedSet();
  const stats = useAlbumStats();
  const albumView = useUIStore((s) => s.albumView);

  const [tab, setTab] = useState<Tab>("album");
  const [selected, setSelected] = useState<Sticker | null>(null);
  const [checker, setChecker] = useState(false);
  const [codes, setCodes] = useState(false);

  return (
    <div className="bg-arena relative min-h-screen overflow-hidden">
      {/* halos decorativos */}
      <div className="pointer-events-none absolute -top-40 -left-40 z-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 z-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="relative sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <span className="font-display text-xl leading-none text-amber-950">MC</span>
              <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
            </div>
            <div className="leading-none">
              <h1 className="font-display text-2xl tracking-wide text-ink sm:text-3xl">
                MALDONADO<span className="text-amber-400">CARDS</span>
              </h1>
              <p className="text-[10px] tracking-[0.28em] text-faint">
                ÁLBUM OFICIAL · CREADORES
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-line bg-veil px-3 py-1.5 sm:flex">
              <span className="font-display text-[10px] tracking-[0.2em] text-faint">
                COLECCIÓN
              </span>
              <span className="font-display text-lg text-emerald-400">{stats.pct}%</span>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-panel-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-all duration-700"
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </div>

            {/* monedas → canje de códigos */}
            <button
              type="button"
              onClick={() => setCodes(true)}
              title="Cargar código de canje"
              className="group flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 transition hover:bg-amber-400/20 active:scale-95"
            >
              <span className="text-base transition group-hover:rotate-12">🪙</span>
              <span
                key={coins}
                className="animate-pop font-display text-lg leading-none text-amber-400"
              >
                {coins}
              </span>
              <span className="ml-0.5 hidden rounded bg-amber-400/20 px-1.5 py-0.5 font-display text-[9px] tracking-widest text-amber-400 sm:inline">
                +CÓDIGO
              </span>
            </button>

            <ThemeToggle className="hidden sm:flex" />
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 font-display text-sm tracking-[0.15em] transition sm:flex-none sm:px-5",
                tab === t.id
                  ? "bg-panel-2 text-ink shadow-inner"
                  : "text-faint hover:bg-panel-2 hover:text-ink",
              )}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
          <ThemeToggle className="sm:hidden" />
        </nav>
      </header>

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative z-[1] overflow-hidden border-b border-line">
        <img
          src={cover}
          alt="Maldonado Cards"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: "var(--hero-img-opacity)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-page via-page/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-page via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-display text-[10px] tracking-[0.3em] text-amber-400">
              EDICIÓN 2026 · {stats.total} FIGURITAS
            </span>
            <button
              type="button"
              onClick={() => setCodes(true)}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-display text-[10px] tracking-[0.3em] text-emerald-400 transition hover:bg-emerald-400/20"
            >
              {CODES.length} CÓDIGOS · {redeemed.length} USADOS
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-display text-[10px] tracking-[0.3em] text-dim">
              {albumView === "panini" ? "📔 HOJA PANINI" : "🗂 CUADRÍCULA"}
            </span>
          </div>
          <h2 className="mt-4 max-w-2xl font-display text-5xl leading-[0.9] tracking-wide text-ink sm:text-7xl">
            LA SELECCIÓN DE MALDONADO,
            <span className="block bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              FIGURITA POR FIGURITA
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-sm text-dim sm:text-base">
            Común, Épico, 80's, Modo Dios, Alternativa y los escudos de los clubes. Abrí sobres,
            pegá las que te faltan, vendé las repetidas y armá tu once ideal con las mejores
            versiones de cada creador.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTab("sobres")}
              className="sheen relative rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3 font-display text-lg tracking-widest text-amber-950 shadow-lg shadow-amber-500/30 transition hover:brightness-110 active:scale-95"
            >
              ABRIR SOBRES
            </button>
            <button
              type="button"
              onClick={() => setTab("album")}
              className="rounded-xl border border-line-strong bg-panel-2 px-6 py-3 font-display text-lg tracking-widest text-ink transition hover:bg-panel-2 active:scale-95"
            >
              VER MI ÁLBUM
            </button>
          </div>

          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "PEGADAS", value: stats.got, tone: "text-emerald-400" },
              { label: "FALTANTES", value: stats.missing, tone: "text-rose-400" },
              { label: "REPETIDAS", value: stats.dupes, tone: "text-amber-400" },
              { label: "SOBRES ABIERTOS", value: packsOpened, tone: "text-cyan-400" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-line bg-page-2/70 px-4 py-3 backdrop-blur"
              >
                <p className="font-display text-[10px] tracking-[0.2em] text-faint">
                  {s.label}
                </p>
                <p className={cn("font-display text-3xl leading-none", s.tone)}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] text-dim">
            <span className="font-display tracking-[0.2em] text-faint">SECCIONES:</span>
            {SECTIONS.map((s) => {
              const list = stickers.filter((x) => x.version === s.version);
              const got = list.filter((x) => ownedSet.has(x.id)).length;
              return (
                <span
                  key={s.version}
                  className="rounded-full border border-line bg-panel-2 px-2.5 py-1"
                >
                  {s.short}{" "}
                  <span className="text-faint">
                    {got}/{list.length}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-line bg-veil py-2">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-8">
              {[
                "Maldonado siempre crea",
                "★★★ MODO DIOS ★★★",
                "Versión 80's · puro retro",
                "Épicas con brillo holográfico",
                "Escudos de los clubes",
                "Repetidas = monedas",
                "Armá tu once ideal",
                "Más que fútbol, creamos historias",
              ].map((txt) => (
                <span
                  key={txt}
                  className="font-display text-sm tracking-[0.25em] text-faint uppercase"
                >
                  {txt} <span className="text-amber-500/70">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENIDO ──────────────────────────────────── */}
      <main className="relative z-[1] mx-auto max-w-7xl px-4 py-8 sm:py-10">
        {tab === "album" && <AlbumView onOpen={setSelected} />}
        {tab === "sobres" && <PacksView onOpenCard={setSelected} />}
        {tab === "once" && <LineupView onOpenCard={setSelected} />}
        {tab === "liga" && <LeagueView />}
      </main>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="relative z-[1] border-t border-line bg-veil">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-display tracking-[0.2em] text-dim">
              MALDONADOCARDS
            </span>{" "}
            · Proyecto de fans de la Selección de Maldonado de Creadores.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span>Progreso guardado en este navegador (zustand + localStorage).</span>
            <button
              type="button"
              onClick={() => setChecker(true)}
              className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 font-display text-[10px] tracking-widest text-sky-300 transition hover:bg-sky-400/20"
            >
              🖼️ VERIFICAR IMÁGENES
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("¿Reiniciar el álbum completo? Se pierden las figuritas y monedas.")) {
                  reset();
                  setSelected(null);
                }
              }}
              className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 font-display text-[10px] tracking-widest text-rose-300 transition hover:bg-rose-400/20"
            >
              REINICIAR ÁLBUM
            </button>
          </div>
        </div>
      </footer>

      {selected && <CardModal sticker={selected} onClose={() => setSelected(null)} />}
      {checker && <ImageChecker onClose={() => setChecker(false)} />}
      {codes && <CodeModal onClose={() => setCodes(false)} />}
    </div>
  );
}
