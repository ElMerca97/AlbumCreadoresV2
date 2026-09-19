export type SlotDef = {
  /** clave de guardado: p0 = arquero, luego defensas, medios y delanteros */
  key: string;
  label: string;
  accepts: string[];
  x: number;
  y: number;
};

export type Formation = {
  id: string;
  name: string;
  format: 5 | 7 | 8 | 11;
  slots: SlotDef[];
};

const POR = ["POR"];

/** Genera los slots ordenados: arquero → defensas → medios → delanteros. */
function build(spec: [string, string[], number, number][]): SlotDef[] {
  return spec.map(([label, accepts, x, y], i) => ({ key: `p${i}`, label, accepts, x, y }));
}

export const FORMATIONS: Formation[] = [
  // ───── FÚTBOL 5 ─────
  {
    id: "f5-121",
    name: "1-2-1 (rombo)",
    format: 5,
    slots: build([
      ["POR", POR, 50, 8],
      ["DEF", ["DEF", "VOL"], 25, 32],
      ["DEF", ["DEF", "VOL"], 75, 32],
      ["MED", ["MED", "MC", "VOL", "MCO"], 50, 56],
      ["DEL", ["DEL", "MCO"], 50, 84],
    ]),
  },
  {
    id: "f5-112",
    name: "1-1-2",
    format: 5,
    slots: build([
      ["POR", POR, 50, 8],
      ["DEF", ["DEF", "VOL"], 50, 32],
      ["MED", ["MED", "MC", "VOL", "MCO"], 50, 56],
      ["DEL", ["DEL", "MCO"], 24, 84],
      ["DEL", ["DEL", "MCO"], 76, 84],
    ]),
  },

  // ───── FÚTBOL 7 ─────
  {
    id: "f7-231",
    name: "2-3-1",
    format: 7,
    slots: build([
      ["POR", POR, 50, 7],
      ["DEF", ["DEF"], 28, 26],
      ["DEF", ["DEF"], 72, 26],
      ["MED", ["MED", "MC", "VOL"], 18, 53],
      ["MED", ["MED", "MC", "VOL"], 50, 50],
      ["MED", ["MED", "MC", "VOL", "MCO"], 82, 53],
      ["DEL", ["DEL", "MCO"], 50, 82],
    ]),
  },
  {
    id: "f7-321",
    name: "3-2-1",
    format: 7,
    slots: build([
      ["POR", POR, 50, 7],
      ["DEF", ["DEF"], 18, 27],
      ["DEF", ["DEF"], 50, 31],
      ["DEF", ["DEF"], 82, 27],
      ["MED", ["MED", "MC", "VOL"], 32, 55],
      ["MED", ["MED", "MC", "VOL", "MCO"], 68, 55],
      ["DEL", ["DEL", "MCO"], 50, 84],
    ]),
  },

  // ───── FÚTBOL 8 ─────
  {
    id: "f8-232",
    name: "2-3-2",
    format: 8,
    slots: build([
      ["POR", POR, 50, 6],
      ["DEF", ["DEF"], 28, 25],
      ["DEF", ["DEF"], 72, 25],
      ["MED", ["MED", "MC", "VOL"], 18, 52],
      ["MED", ["MED", "MC", "VOL"], 50, 48],
      ["MED", ["MED", "MC", "VOL", "MCO"], 82, 52],
      ["DEL", ["DEL", "MCO"], 30, 80],
      ["DEL", ["DEL", "MCO"], 70, 80],
    ]),
  },
  {
    id: "f8-331",
    name: "3-3-1",
    format: 8,
    slots: build([
      ["POR", POR, 50, 6],
      ["DEF", ["DEF"], 20, 26],
      ["DEF", ["DEF"], 50, 30],
      ["DEF", ["DEF"], 80, 26],
      ["MED", ["MED", "MC", "VOL"], 25, 53],
      ["MED", ["MED", "MC", "VOL"], 50, 50],
      ["MED", ["MED", "MC", "VOL", "MCO"], 75, 53],
      ["DEL", ["DEL", "MCO"], 50, 84],
    ]),
  },

  // ───── FÚTBOL 11 ─────
  {
    id: "f11-433",
    name: "4-3-3",
    format: 11,
    slots: build([
      ["POR", POR, 50, 7],
      ["DEF", ["DEF"], 14, 27],
      ["DEF", ["DEF"], 38, 33],
      ["DEF", ["DEF"], 62, 33],
      ["DEF", ["DEF"], 86, 27],
      ["MED", ["MED", "MC", "VOL"], 22, 51],
      ["MCO", ["MCO", "MED", "MC"], 50, 49],
      ["MED", ["MED", "MC", "VOL"], 78, 51],
      ["DEL", ["DEL"], 20, 76],
      ["DEL", ["DEL", "MCO"], 50, 79],
      ["DEL", ["DEL"], 80, 76],
    ]),
  },
  {
    id: "f11-442",
    name: "4-4-2",
    format: 11,
    slots: build([
      ["POR", POR, 50, 7],
      ["DEF", ["DEF"], 14, 27],
      ["DEF", ["DEF"], 38, 33],
      ["DEF", ["DEF"], 62, 33],
      ["DEF", ["DEF"], 86, 27],
      ["MED", ["MED", "MC", "VOL"], 14, 52],
      ["MED", ["MED", "MC"], 38, 49],
      ["MCO", ["MCO", "MED", "MC"], 62, 49],
      ["MED", ["MED", "MC", "VOL"], 86, 52],
      ["DEL", ["DEL"], 36, 80],
      ["DEL", ["DEL", "MCO"], 64, 80],
    ]),
  },
  {
    id: "f11-352",
    name: "3-5-2",
    format: 11,
    slots: build([
      ["POR", POR, 50, 7],
      ["DEF", ["DEF"], 22, 27],
      ["DEF", ["DEF"], 50, 32],
      ["DEF", ["DEF"], 78, 27],
      ["MED", ["MED", "MC", "VOL"], 10, 52],
      ["MED", ["MED", "MC", "VOL"], 33, 49],
      ["MCO", ["MCO", "MED", "MC"], 50, 55],
      ["MED", ["MED", "MC", "VOL"], 67, 49],
      ["MED", ["MED", "MC", "VOL"], 90, 52],
      ["DEL", ["DEL"], 37, 81],
      ["DEL", ["DEL", "MCO"], 63, 81],
    ]),
  },
];

export const FORMATS: { format: 5 | 7 | 8 | 11; label: string; blurb: string }[] = [
  { format: 5, label: "FÚTBOL 5", blurb: "Futsal / cancha chica" },
  { format: 7, label: "FÚTBOL 7", blurb: "Siete contra siete" },
  { format: 8, label: "FÚTBOL 8", blurb: "Ocho contra ocho" },
  { format: 11, label: "FÚTBOL 11", blurb: "Cancha completa" },
];

export const DEFAULT_FORMATION = "f11-433";

export const formationById = (id: string) =>
  FORMATIONS.find((f) => f.id === id) ?? FORMATIONS.find((f) => f.id === DEFAULT_FORMATION)!;

export const formationsFor = (format: number) => FORMATIONS.filter((f) => f.format === format);
