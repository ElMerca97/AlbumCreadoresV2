import { useEffect, useRef, useState } from "react";
import { CODES } from "@/data/codes";
import { useAlbumStore } from "@/store/albumStore";
import { cn } from "@/utils/cn";

export default function CodeModal({ onClose }: { onClose: () => void }) {
  const redeem = useAlbumStore((s) => s.redeem);
  const redeemed = useAlbumStore((s) => s.redeemed);
  const coins = useAlbumStore((s) => s.coins);

  const [value, setValue] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
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
    const res = redeem(value);
    setStatus({ ok: res.ok, message: res.message });
    if (res.ok) {
      setValue("");
      setReveal(null);
    }
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
            <p className="font-display text-sm tracking-widest text-amber-400">{coins} 🪙</p>
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
      </div>
    </div>
  );
}
