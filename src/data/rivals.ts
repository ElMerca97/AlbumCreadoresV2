export type Rival = {
  /** id único del rival (NO debe coincidir con ids de equipos del Fixture). */
  id: string;
  /** nombre visible del rival. */
  name: string;
  /** fuerza del rival, de 1 (débil) a 5 (muy fuerte). Se usará en la ETAPA 2. */
  strength: 1 | 2 | 3 | 4 | 5;
};

/**
 * Rivales ficticios para partidos amistosos. Ninguno pertenece a los equipos
 * del Fixture (ver `src/data/league.ts`: seleccion, carolino, chiveo, mazzoni,
 * sacachispas, presion, vikingos), así que pueden usarse libremente.
 */
export const RIVALS: Rival[] = [
  { id: "r-estrella-roja", name: "Estrella Roja FC", strength: 1 },
  { id: "r-atletico-sol", name: "Atlético Sol", strength: 2 },
  { id: "r-deportivo-luna", name: "Deportivo Luna", strength: 2 },
  { id: "r-union-mar", name: "Unión del Mar", strength: 3 },
  { id: "r-real-colina", name: "Real Colina", strength: 3 },
  { id: "r-sporting-rio", name: "Sporting Río", strength: 4 },
  { id: "r-galacticos-uy", name: "Galácticos UY", strength: 5 },
];

export function pickRival(): Rival {
  return RIVALS[Math.floor(Math.random() * RIVALS.length)];
}
