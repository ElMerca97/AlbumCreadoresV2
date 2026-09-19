import { useEffect, useState } from "react";

/**
 * Raíz desde donde se cargan las imágenes del array.
 *
 * Por defecto es "" (vacío): las rutas del array (`images/stickers/...`) se
 * resuelven relativas al index.html, o sea que corresponden a la carpeta
 * `public/images/...` del proyecto (Vite la copia tal cual a `dist/images`).
 *
 * Si algún día las subís a un CDN, cambiá esto por ej. a
 * "https://mi-cdn.com/maldonadocards/" y listo.
 */
export const IMAGES_ROOT: string = "";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

export const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Une la raíz con la ruta del array y la codifica para URL. */
export function imageUrl(path: string) {
  const clean = path.replace(/^\/+/, "");
  const root = IMAGES_ROOT ? IMAGES_ROOT.replace(/\/?$/, "/") : "";
  return encodeURI(root + clean);
}

/**
 * Variantes que se prueban en orden si la ruta exacta no existe:
 *   1. la ruta exacta del array
 *   2. la misma sin acentos (AarónComun.png → AaronComun.png)
 *   3. las anteriores con otras extensiones (.jpg, .jpeg, .webp)
 */
export function imageCandidates(path: string): string[] {
  const bases = [path];
  const noAccent = stripAccents(path);
  if (noAccent !== path) bases.push(noAccent);

  const out: string[] = [];
  for (const b of bases) out.push(imageUrl(b));
  for (const b of bases) {
    const withoutExt = b.replace(/\.[a-z0-9]+$/i, "");
    for (const ext of IMAGE_EXTENSIONS) {
      const alt = `${withoutExt}.${ext}`;
      if (alt !== b) out.push(imageUrl(alt));
    }
  }
  return [...new Set(out)];
}

// ── Caché compartida (evita re-pedir imágenes que ya sabemos que fallan) ──
const cache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

function tryLoad(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/** Devuelve la URL que cargó bien o `null` si no existe ninguna variante. */
export function resolveImage(path: string): Promise<string | null> {
  if (cache.has(path)) return Promise.resolve(cache.get(path) ?? null);
  const pending = inflight.get(path);
  if (pending) return pending;

  const p = (async () => {
    for (const url of imageCandidates(path)) {
      if (await tryLoad(url)) {
        cache.set(path, url);
        inflight.delete(path);
        return url;
      }
    }
    cache.set(path, null);
    inflight.delete(path);
    return null;
  })();

  inflight.set(path, p);
  return p;
}

export function clearImageCache() {
  cache.clear();
}

export type ImageState = { status: "loading" | "ok" | "missing"; src: string | null };

/** Hook: resuelve la imagen de una figurita con fallbacks y caché. */
export function useStickerImage(path: string): ImageState {
  const [state, setState] = useState<ImageState>(() => {
    if (cache.has(path)) {
      const src = cache.get(path) ?? null;
      return { status: src ? "ok" : "missing", src };
    }
    return { status: "loading", src: null };
  });

  useEffect(() => {
    let alive = true;
    resolveImage(path).then((src) => {
      if (alive) setState({ status: src ? "ok" : "missing", src });
    });
    return () => {
      alive = false;
    };
  }, [path]);

  return state;
}
