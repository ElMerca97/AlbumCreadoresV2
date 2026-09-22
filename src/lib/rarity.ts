import type { Rarity, Sticker } from "@/data/stickers";

export type RarityTheme = {
  name: Rarity;
  frame: string; // gradient del marco exterior
  frameText: string;
  body: string; // fondo interno de la carta
  accentText: string;
  chip: string;
  glow: string;
  ring: string;
  holo: boolean;
  scanlines: boolean;
  initials: string; // fondo del avatar generado
  badge: string;
};

export const RARITY: Record<Rarity, RarityTheme> = {
  "COURT": {
    name: "COURT",
    frame: "from-teal-400 via-emerald-400 to-lime-400",
    frameText: "text-emerald-950",
    body: "from-teal-50 via-emerald-50 to-lime-50",
    accentText: "text-teal-800",
    chip: "bg-teal-900/10 text-teal-900 border-teal-900/20",
    glow: "shadow-[0_8px_24px_-10px_rgba(45,197,120,0.7)]",
    ring: "ring-teal-400/60",
    holo: false,
    scanlines: false,
    initials: "from-teal-200 via-emerald-100 to-lime-200",
    badge: "bg-teal-900 text-white",
  },
  "COMÚN": {
    name: "COMÚN",
    frame: "from-slate-200 via-white to-slate-400",
    frameText: "text-slate-900",
    body: "from-slate-50 via-slate-100 to-slate-300",
    accentText: "text-slate-700",
    chip: "bg-slate-900/10 text-slate-800 border-slate-900/15",
    glow: "shadow-[0_10px_30px_-10px_rgba(100,116,139,0.55)]",
    ring: "ring-slate-400/50",
    holo: false,
    scanlines: false,
    initials: "from-slate-300 via-slate-200 to-slate-400",
    badge: "bg-slate-900 text-white",
  },
  "ÉPICO": {
    name: "ÉPICO",
    frame: "from-violet-500 via-fuchsia-600 to-indigo-700",
    frameText: "text-white",
    body: "from-violet-100 via-fuchsia-50 to-indigo-200",
    accentText: "text-violet-800",
    chip: "bg-violet-900/10 text-violet-900 border-violet-900/20",
    glow: "shadow-[0_12px_38px_-12px_rgba(139,92,246,0.85)]",
    ring: "ring-fuchsia-400/60",
    holo: true,
    scanlines: false,
    initials: "from-violet-300 via-fuchsia-200 to-indigo-300",
    badge: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
  },
  "80'S": {
    name: "80'S",
    frame: "from-amber-400 via-orange-500 to-rose-600",
    frameText: "text-white",
    body: "from-amber-50 via-orange-50 to-rose-100",
    accentText: "text-orange-800",
    chip: "bg-orange-900/10 text-orange-900 border-orange-900/20",
    glow: "shadow-[0_12px_38px_-12px_rgba(249,115,22,0.85)]",
    ring: "ring-orange-400/60",
    holo: true,
    scanlines: true,
    initials: "from-amber-300 via-orange-200 to-rose-300",
    badge: "bg-gradient-to-r from-orange-500 to-rose-600 text-white",
  },
  "MODO DIOS": {
    name: "MODO DIOS",
    frame: "from-yellow-200 via-amber-400 to-yellow-600",
    frameText: "text-yellow-950",
    body: "from-yellow-50 via-amber-50 to-yellow-200",
    accentText: "text-amber-800",
    chip: "bg-amber-900/10 text-amber-900 border-amber-900/20",
    glow: "shadow-[0_14px_45px_-10px_rgba(250,204,21,0.9)]",
    ring: "ring-amber-300/70",
    holo: true,
    scanlines: false,
    initials: "from-amber-200 via-yellow-100 to-amber-300",
    badge: "bg-gradient-to-r from-yellow-400 to-amber-600 text-amber-950",
  },
  "ALTERNATIVA": {
    name: "ALTERNATIVA",
    frame: "from-cyan-300 via-teal-400 to-fuchsia-600",
    frameText: "text-white",
    body: "from-cyan-50 via-teal-50 to-fuchsia-100",
    accentText: "text-teal-800",
    chip: "bg-teal-900/10 text-teal-900 border-teal-900/20",
    glow: "shadow-[0_14px_45px_-10px_rgba(45,212,191,0.85)]",
    ring: "ring-cyan-300/70",
    holo: true,
    scanlines: false,
    initials: "from-cyan-200 via-teal-200 to-fuchsia-300",
    badge: "bg-gradient-to-r from-cyan-400 to-fuchsia-600 text-white",
  },
  "ESCUDO": {
    name: "ESCUDO",
    frame: "from-sky-400 via-blue-600 to-indigo-800",
    frameText: "text-white",
    body: "from-sky-50 via-blue-50 to-indigo-100",
    accentText: "text-blue-800",
    chip: "bg-blue-900/10 text-blue-900 border-blue-900/20",
    glow: "shadow-[0_12px_38px_-12px_rgba(37,99,235,0.85)]",
    ring: "ring-sky-400/60",
    holo: false,
    scanlines: false,
    initials: "from-sky-200 via-blue-200 to-indigo-300",
    badge: "bg-gradient-to-r from-sky-500 to-indigo-700 text-white",
  },
};

export const rarityTheme = (s: Sticker): RarityTheme => RARITY[s.rarity] ?? RARITY["COMÚN"];

/** Valor de venta / recompensa por repetida. */
export const SELL_VALUE: Record<Rarity, number> = {
  "COURT": 60,
  "COMÚN": 25,
  "ÉPICO": 90,
  "80'S": 150,
  "MODO DIOS": 320,
  "ALTERNATIVA": 400,
  "ESCUDO": 60,
};

export function initials(name: string) {
  const clean = name
    .replace(/['’]/g, "")
    .replace(/\b(de|del|la|los|las|el)\b/gi, " ")
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return (parts[0][0] + parts[1][0] + (parts[2]?.[0] ?? "")).toUpperCase();
}

export const shortName = (name: string) =>
  name.includes("'") ? name.split("'")[0].trim() : name;

export function statColor(value: number) {
  if (value >= 95) return "from-emerald-400 to-lime-300";
  if (value >= 85) return "from-lime-400 to-green-300";
  if (value >= 70) return "from-yellow-400 to-amber-300";
  if (value >= 55) return "from-orange-400 to-amber-300";
  return "from-rose-500 to-orange-400";
}
