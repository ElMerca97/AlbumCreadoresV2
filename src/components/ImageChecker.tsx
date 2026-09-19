import { useEffect, useMemo, useState } from "react";
import { stickers } from "@/data/stickers";
import { IMAGES_ROOT, clearImageCache, resolveImage } from "@/lib/images";
import { cn } from "@/utils/cn";

type Row = { id: number; name: string; path: string; status: "loading" | "ok" | "missing"; src: string | null };

const folderOf = (p: string) => p.slice(0, p.lastIndexOf("/"));
const fileOf = (p: string) => p.slice(p.lastIndexOf("/") + 1);

export default function ImageChecker({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<Row[]>(() =>
    stickers.map((s) => ({ id: s.id, name: s.name, path: s.image, status: "loading", src: null })),
  );
  const [runId, setRunId] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setRows((rs) => rs.map((r) => ({ ...r, status: "loading", src: null })));
    stickers.forEach((s) => {
      resolveImage(s.image).then((src) => {
        if (!alive) return;
        setRows((rs) =>
          rs.map((r) => (r.id === s.id ? { ...r, status: src ? "ok" : "missing", src } : r)),
        );
      });
    });
    return () => {
      alive = false;
    };
  }, [runId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const groups = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of rows) {
      const f = folderOf(r.path);
      if (!map.has(f)) map.set(f, []);
      map.get(f)!.push(r);
    }
    return [...map.entries()];
  }, [rows]);

  const ok = rows.filter((r) => r.status === "ok").length;
  const missing = rows.filter((r) => r.status === "missing");
  const loading = rows.filter((r) => r.status === "loading").length;

  const copyMissing = async () => {
    const text = missing.map((m) => `public/${m.path}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const recheck = () => {
    clearImageCache();
    setRunId((n) => n + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-pop relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-line bg-page-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-wide text-ink sm:text-3xl">
                VERIFICADOR DE IMÁGENES
              </h2>
              <p className="mt-1 text-sm text-dim">
                Copiá tus PNG en{" "}
                <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs text-amber-200">
                  public/images/…
                </code>{" "}
                respetando exactamente estos nombres. Raíz actual:{" "}
                <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs text-amber-200">
                  {IMAGES_ROOT || "(misma carpeta que index.html)"}
                </code>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-2 text-ink hover:bg-line-strong"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 font-display tracking-widest text-emerald-300">
              {ok} OK
            </span>
            <span className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 font-display tracking-widest text-rose-300">
              {missing.length} FALTAN
            </span>
            {loading > 0 && (
              <span className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 font-display tracking-widest text-dim">
                {loading} VERIFICANDO…
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={recheck}
                className="rounded-lg bg-panel-2 px-3 py-1.5 font-display text-xs tracking-widest text-ink hover:bg-line-strong"
              >
                RE-VERIFICAR
              </button>
              {missing.length > 0 && (
                <button
                  type="button"
                  onClick={copyMissing}
                  className="rounded-lg bg-amber-400 px-3 py-1.5 font-display text-xs tracking-widest text-amber-950 hover:brightness-110"
                >
                  {copied ? "¡COPIADO!" : "COPIAR FALTANTES"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5 sm:p-6">
          {groups.map(([folder, list]) => {
            const okCount = list.filter((r) => r.status === "ok").length;
            return (
              <div key={folder} className="mb-6 last:mb-0">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-display text-sm tracking-[0.2em] text-amber-300">
                    public/{folder}/
                  </h3>
                  <span className="font-display text-xs tracking-widest text-faint">
                    {okCount}/{list.length}
                  </span>
                </div>
                <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-line bg-veil">
                  {list.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                          r.status === "ok" && "bg-emerald-400/20 text-emerald-300",
                          r.status === "missing" && "bg-rose-400/20 text-rose-300",
                          r.status === "loading" && "bg-panel-2 text-dim",
                        )}
                      >
                        {r.status === "ok" ? "✓" : r.status === "missing" ? "✕" : "…"}
                      </span>
                      {r.status === "ok" && r.src ? (
                        <img src={r.src} alt="" className="h-8 w-8 rounded object-contain" />
                      ) : (
                        <span className="h-8 w-8 rounded border border-dashed border-line-strong" />
                      )}
                      <code
                        className={cn(
                          "truncate font-mono text-xs",
                          r.status === "missing" ? "text-rose-200" : "text-ink",
                        )}
                      >
                        {fileOf(r.path)}
                      </code>
                      <span className="ml-auto truncate text-xs text-faint">{r.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
