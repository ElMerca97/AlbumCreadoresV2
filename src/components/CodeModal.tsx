import { useEffect, useRef, useState } from "react";
import { CODES } from "@/data/codes";
import { useAlbumStore } from "@/store/albumStore";
import { useFriendlyStore } from "@/store/friendlyStore";
import { useLeagueStore } from "@/store/leagueStore";
import { cn } from "@/utils/cn";
import CoinIcon from "./CoinIcon";

/** Código administrativo especial: abre el panel admin y NUNCA se consume. */
const ADMIN_CODE = "ADMIN97";

export default function CodeModal({ onClose }: { onClose: () => void }) {
  const redeem = useAlbumStore((s) => s.redeem);
  const addCoins = useAlbumStore((s) => s.addCoins);
  const redeemed = useAlbumStore((s) => s.redeemed);
  const coins = useAlbumStore((s) => s.coins);
  const resetFriendlies = useFriendlyStore((s) => s.resetFriendlies);
  const resetFixture = useLeagueStore((s) => s.resetFixture);

  const [value, setValue] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [adminCoins, setAdminCoins] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 120);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // ADMIN97 abre el panel administrador sin consumirse ni entrar en redeemed.
    if (value.trim().toUpperCase().replace(/\s+/g, "") === ADMIN_CODE) {
      setAdmin(true);
      setStatus(null);
      setValue("");
      return;
    }
    const res = redeem(value);
    setStatus({ ok: res.ok, message: res.message });
    if (res.ok) {
      setValue("");
      setReveal(null);
    }
  };

  /** Panel admin: agrega CreaCoins con el addCoins() existente. */
  const submitAdminCoins = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(adminCoins);
    if (adminCoins.trim() === "" || !Number.isFinite(n) || n <= 0) {
      setStatus({ ok: false, message: "Ingresá una cantidad positiva mayor que 0." });
      return;
    }
    addCoins(n);
    setAdminCoins("");
    setStatus({ ok: true, message: `+${n} CreaCoins agregados correctamente.` });
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-pop relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-page-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-line p-5 sm:p-6">
          <div
            className="pointer-events-none absolute -top-24 -right-16 h-52 w-52 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 opacity-20 blur-3xl"
            aria-hidden
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-panel-2 text-dim transition hover:bg-panel-2 hover:text-ink"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <p className="font-display text-[10px] tracking-[0.3em] text-amber-500">
            CANJE DE CÓDIGOS
          </p>
          <h2 className="mt-1 font-display text-3xl leading-none tracking-wide text-ink">
            CARGÁ TU CÓDIGO
          </h2>
          <p className="mt-2 text-sm text-dim">
            Tocá las monedas cuando quieras para volver acá. Cada código se puede usar una sola vez
            por navegador.
          </p>
        </div>

        {admin ? (
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="font-display text-[10px] tracking-[0.3em] text-rose-400">
                PANEL ADMINISTRADOR · MODO LOCAL
              </p>
              <button
                type="button"
                onClick={() => {
                  setAdmin(false);
                  setStatus(null);
                }}
                className="rounded-lg border border-line px-2.5 py-1 font-display text-[10px] tracking-widest text-dim transition hover:border-line-strong hover:text-ink"
              >
                SALIR
              </button>
            </div>
            <p className="mt-2 text-xs text-dim">
              Herramienta administrativa del proyecto. No es un sistema de seguridad.
            </p>

            {status && (
              <p
                className={cn(
                  "animate-fade-up mt-4 rounded-xl border px-4 py-2.5 text-sm",
                  status.ok
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-rose-400/30 bg-rose-400/10 text-rose-300",
                )}
              >
                {status.message}
              </p>
            )}

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="font-display text-xs tracking-widest text-amber-500">
                  AMISTOSOS
                </p>
                <p className="mt-1 text-xs text-dim">
                  Restablece el límite a 3/3 (últimas 5 horas). No borra historial ni monedas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetFriendlies();
                    setStatus({ ok: true, message: "Amistosos restablecidos: 3/3 disponibles." });
                  }}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 px-4 py-2.5 font-display text-sm tracking-widest text-emerald-950 transition hover:brightness-110 active:scale-95"
                >
                  RESET AMISTOSOS
                </button>
              </div>

              <form onSubmit={submitAdminCoins} className="rounded-2xl border border-line bg-panel p-4">
                <p className="font-display text-xs tracking-widest text-amber-500">
                  CREACOINS
                </p>
                <p className="mt-1 text-xs text-dim">
                  Suma la cantidad exacta con el sistema de monedas existente.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={adminCoins}
                    onChange={(e) => {
                      setAdminCoins(e.target.value);
                      setStatus(null);
                    }}
                    placeholder="1000"
                    className="min-w-0 flex-1 rounded-xl border border-line bg-page-2 px-4 py-2.5 font-display text-ink focus:border-amber-400/70 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2.5 font-display text-sm tracking-widest text-amber-950 transition hover:brightness-110 active:scale-95"
                  >
                    AGREGAR CREACOINS
                  </button>
                </div>
              </form>

              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="font-display text-xs tracking-widest text-amber-500">
                  FIXTURE
                </p>
                <p className="mt-1 text-xs text-dim">
                  Deja la liga 0-0: borra resultados de partidos y la tabla vuelve a 0. Solo
                  afecta la liga, no el álbum ni las monedas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("¿Reiniciar el Fixture? Todos los partidos vuelven a 0-0.")) {
                      resetFixture();
                      setStatus({ ok: true, message: "Fixture reiniciado: tabla en 0 puntos." });
                    }
                  }}
                  className="mt-3 w-full rounded-xl bg-panel-2 px-4 py-2.5 font-display text-sm tracking-widest text-ink transition hover:bg-line-strong active:scale-95"
                >
                  RESET FIXTURE
                </button>
              </div>
            </div>
          </div>
        ) : (
        <form onSubmit={submit} className="p-5 sm:p-6">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value.toUpperCase());
                setStatus(null);
              }}
              placeholder="MALDONADO10"
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-line bg-panel px-4 py-3 font-display text-lg tracking-[0.2em] text-ink placeholder:text-faint focus:border-amber-400/70 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-3 font-display tracking-widest text-amber-950 transition hover:brightness-110 active:scale-95"
            >
              CANJEAR
            </button>
          </div>

          {status && (
            <p
              className={cn(
                "animate-fade-up mt-3 rounded-xl border px-4 py-2.5 text-sm",
                status.ok
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-rose-400/30 bg-rose-400/10 text-rose-300",
              )}
            >
              {status.message}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between">
            <p className="font-display text-[10px] tracking-[0.25em] text-faint">
              PISTAS · {redeemed.length}/{CODES.length} USADOS
            </p>
            <p className="font-display text-sm tracking-widest text-amber-400">
              {coins} <CoinIcon />
            </p>
          </div>

          <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {CODES.map((c) => {
              const used = redeemed.includes(c.code);
              const open = reveal === c.code;
              return (
                <li
                  key={c.code}
                  className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-2"
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]",
                      used
                        ? "bg-emerald-400/20 text-emerald-400"
                        : "bg-panel-2 text-faint",
                    )}
                  >
                    {used ? "✓" : "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-dim">{c.hint}</p>
                    <p
                      className={cn(
                        "font-display text-sm tracking-[0.15em] transition",
                        open ? "text-amber-400" : "text-faint blur-[5px] select-none",
                      )}
                    >
                      {c.code}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReveal(open ? null : c.code)}
                    className="shrink-0 rounded-lg border border-line px-2.5 py-1 font-display text-[10px] tracking-widest text-dim transition hover:border-line-strong hover:text-ink"
                  >
                    {open ? "OCULTAR" : "VER"}
                  </button>
                </li>
              );
            })}
          </ul>
        </form>
        )}
      </div>
    </div>
  );
}
