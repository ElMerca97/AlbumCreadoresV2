export type CodeDef = {
  code: string;
  hint: string;
  coins: number;
  gifts?: number[];
};

/** Códigos de canje disponibles (mayúsculas, sin espacios). */
export const CODES: CodeDef[] = [
  { code: "MALDONADO10", coins: 500, hint: "El nombre del proyecto y un número redondo." },
  { code: "MODODIOS", coins: 1500, hint: "La rareza más alta del álbum, sin espacios." },
  { code: "CREADORES", coins: 777, hint: "La Selección de Maldonado de…" },
  { code: "SANGARAZA10", coins: 1010, hint: "El 10 siempre crea." },
  { code: "ROLANGAS69", coins: 690, hint: "Mediocampista con la camiseta 69." },
  { code: "PETI3", coins: 300, hint: "Apodo del defensor número 3." },
  { code: "VINTAGE80", coins: 880, hint: "Retro, VHS y garra." },
  { code: "MALDONADOCARDS", coins: 2026, hint: "El nombre completo, una palabra. Edición 2026." },
  {
    code: "ESCUDOCAROLINO",
    coins: 250,
    gifts: [100],
    hint: "Pegá el escudo del FC Carolino.",
  },
  {
    code: "ALTERNATIVA",
    coins: 400,
    gifts: [94],
    hint: "Trae una figurita de otra dimensión.",
  },
];

/** Busca un código de canje normalizado (mayúsculas, sin espacios). */
export function findCode(raw: string): { coins: number; gifts?: number[] } | undefined {
  const code = raw.trim().toUpperCase().replace(/\s+/g, "");
  return CODES.find((c) => c.code === code);
}
