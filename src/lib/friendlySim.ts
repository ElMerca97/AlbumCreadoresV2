/**
 * MOTOR DE SIMULACIÓN DEL PARTIDO AMISTOSO (Etapa 2).
 *
 * Simulador PURO: misma entrada + misma seed => mismo partido.
 * El resultado completo se determina UNA SOLA VEZ al comenzar.
 * OMITIR / render / animación solo REVELAN lo ya generado.
 *
 * No modifica stickers.ts ni rivals.ts: el arquero sin stats usa un
 * fallback interno basado en rating, y el rival usa una plantilla
 * sintética generada aquí.
 */

import type { Formation } from "@/data/formations";
import type { Rival } from "@/data/rivals";

// ───────────────────────── TIPOS ─────────────────────────

export type SimPlayer = {
  formationId: string;
  slotKey: string;
  stickerId: number | null; // null = jugador sintético del rival
  playerId: string;
  name: string;
  pos: string; // normalizada: POR | DEF | VOL | MC | MED | MCO | DEL
  rating: number;
  stats?: { Tiro: number; Pase: number; Velocidad: number; Defensa: number };
};

export type SimEvent = {
  minute: number;
  team: "home" | "away";
  type: "goal";
  scorer: string;
  scorerPlayerId: string;
  assist?: string;
  assistPlayerId?: string;
};

export type SimPerformance = {
  playerId: string;
  name: string;
  pos: string;
  goals: number;
  assists: number;
  /** Participación: 1 por jugar + 3 por gol + 2 por asistencia. */
  points: number;
};

export type SimOutcome = "victoria" | "empate" | "derrota";

/** Tipos de beats del relato (los goles son los eventos de juego existentes). */
export type TimelineKind =
  | "goal"
  | "pase"
  | "centro"
  | "remate"
  | "atajada"
  | "recuperacion"
  | "contraataque"
  | "palo"
  | "comentario";

/** Evento del relato dinámico. Los goles arrastran el SimEvent original. */
export type TimelineEvent = {
  minute: number;
  kind: TimelineKind;
  team: "home" | "away";
  text: string;
  /** Presente sólo cuando kind === "goal". */
  goal?: SimEvent;
};

export type SimResult = {
  homeGoals: number;
  awayGoals: number;
  outcome: SimOutcome;
  events: SimEvent[];
  /** Relato completo ordenado por minuto (goles + jugadas + comentarios). */
  timeline: TimelineEvent[];
  /** Goles por playerId (para tabla de goleadores en Etapa 3). */
  goalsByPlayer: Record<string, number>;
  /** Asistencias por playerId (para tabla de asistidores en Etapa 3). */
  assistsByPlayer: Record<string, number>;
  /** Rendimiento por playerId del partido. */
  performances: SimPerformance[];
  /** Jugadores que participaron directamente en goles/asistencias. */
  participants: number;
};

export type SimInput = {
  formation: Formation;
  /** Snapshot de la alineación de Mi Equipo al momento de iniciar. */
  home: SimPlayer[];
  rival: Rival;
  seed: number;
};

export const HOME_TEAM_NAME = "SELECCIÓN DE CREADORES";

// ───────────────────── RNG DETERMINISTA ─────────────────────

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

const randInt = (rng: Rng, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

// ───────────────────── POSICIONES ─────────────────────

/** Normaliza cualquier variante de posición a las 7 canónicas. */
export function normalizePos(pos: string): string {
  const p = pos.trim().toUpperCase();
  if (p === "POR" || p === "GK" || p === "GOL") return "POR";
  if (p === "DEF" || p === "DFC" || p === "LD" || p === "LI") return "DEF";
  if (p === "VOL") return "VOL";
  if (p === "MC" || p === "MCD") return "MC";
  if (p === "MED" || p === "MI" || p === "MD" || p === "EI" || p === "ED")
    return "MED";
  if (p === "MCO" || p === "MCC") return "MCO";
  if (p === "DEL" || p === "DC" || p === "SD") return "DEL";
  return p;
}

/** Peso de gol por posición. POR casi nunca convierte. */
const GOAL_POS_WEIGHT: Record<string, number> = {
  POR: 0.02,
  DEF: 0.25,
  VOL: 0.7,
  MC: 1.0,
  MED: 1.0,
  MCO: 1.35,
  DEL: 2.1,
};

/** Peso de asistencia por posición. POR prácticamente nunca asiste. */
const ASSIST_POS_WEIGHT: Record<string, number> = {
  POR: 0.02,
  DEF: 0.2,
  VOL: 1.0,
  MC: 1.2,
  MED: 1.5,
  MCO: 1.6,
  DEL: 1.3,
};

/** Ponderación defensiva por posición (influencia en evitar goles). */
const DEF_POS_WEIGHT: Record<string, number> = {
  POR: 1.0,
  DEF: 1.0,
  VOL: 0.55,
  MC: 0.4,
  MED: 0.3,
  MCO: 0.3,
  DEL: 0.15,
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// ─────────────────── FALLBACK DEL ARQUERO ───────────────────

/**
 * Los POR no tienen stats completas en stickers.ts. Para la simulación se
 * calcula un rendimiento defensivo interno basado en el rating.
 * NO modifica stickers.ts.
 */
function keeperDefense(rating: number, statDefensa?: number): number {
  if (typeof statDefensa === "number") return statDefensa;
  // rating 70 -> ~65, rating 99 -> ~91 (curva suave).
  return Math.min(99, Math.round(58 + (rating - 70) * 0.9));
}

/** Stats con fallback para cualquier jugador de campo. */
function safeStat(
  player: SimPlayer,
  key: "Tiro" | "Pase" | "Velocidad",
): number {
  const v = player.stats?.[key];
  if (typeof v === "number") return v;
  return Math.min(99, Math.round(player.rating * 0.85));
}

// ─────────────────── FUERZA DE UN EQUIPO ───────────────────

export type TeamStrength = { attack: number; defense: number };

/**
 * Fuerza ofensiva/defensiva a partir del snapshot:
 * - Ataque: Tiro, Pase, Velocidad y rating de los jugadores de campo,
 *   ponderados por el peso ofensivo de la posición.
 * - Defensa: DEF (peso alto) + mediocampo (medio) + arquero (fallback).
 */
export function computeTeamStrength(players: SimPlayer[]): TeamStrength {
  if (players.length === 0) return { attack: 60, defense: 60 };

  let attSum = 0;
  let attWeight = 0;
  let defSum = 0;
  let defWeight = 0;

  for (const p of players) {
    const pos = normalizePos(p.pos);

    if (pos === "POR") {
      const k = keeperDefense(p.rating, p.stats?.Defensa);
      defSum += k * DEF_POS_WEIGHT.POR;
      defWeight += DEF_POS_WEIGHT.POR;
      continue;
    }

    const tiro = safeStat(p, "Tiro");
    const pase = safeStat(p, "Pase");
    const vel = safeStat(p, "Velocidad");

    const offPos = GOAL_POS_WEIGHT[pos] ?? 0.6;
    // Tiro domina; Pase, Velocidad y rating acompañan.
    const individual = 0.45 * tiro + 0.25 * pase + 0.15 * vel + 0.15 * p.rating;
    attSum += individual * offPos;
    attWeight += offPos;

    const defensa = p.stats?.Defensa ?? Math.round(p.rating * 0.85);
    const defPos = DEF_POS_WEIGHT[pos] ?? 0.4;
    defSum += defensa * defPos;
    defWeight += defPos;
  }

  return {
    attack: attWeight > 0 ? attSum / attWeight : 60,
    defense: defWeight > 0 ? defSum / defWeight : 60,
  };
}

// ─────────────── PLANTILLA SINTÉTICA DEL RIVAL ───────────────

const RIVAL_SURNAMES = [
  "Ríos", "Cabrera", "Sosa", "Pereira", "Silva", "Méndez", "Ferro",
  "Duarte", "Lemos", "Olivera", "Pintos", "Viera", "Barrios", "Talice",
];

/**
 * Genera la plantilla del rival respetando las líneas de la formación
 * (POR / DEF / MED / DEL según slots). NO agrega nada a stickers.ts.
 */
export function buildRivalSquad(
  formation: Formation,
  rival: Rival,
  rng: Rng,
): SimPlayer[] {
  // Rating base según strength 1-5: 65 (débil) a 93 (muy fuerte).
  const base = 58 + rival.strength * 7;

  return formation.slots.map((slot, i) => {
    const pos = normalizePos(slot.label);
    const rating = Math.min(
      99,
      Math.max(50, base + randInt(rng, -5, 5) + (pos === "DEL" ? 2 : 0)),
    );
    const stat = () => clamp(rating + randInt(rng, -6, 6), 35, 99);
    const surname =
      RIVAL_SURNAMES[(i * 3 + rival.strength) % RIVAL_SURNAMES.length];
    return {
      formationId: formation.id,
      slotKey: slot.key,
      stickerId: null,
      playerId: `${rival.id}:${slot.key}`,
      name: `${surname} ${i + 1}`,
      pos,
      rating,
      stats: {
        Tiro: pos === "POR" ? 30 : stat(),
        Pase: stat(),
        Velocidad: stat(),
        Defensa:
          pos === "POR" ? keeperDefense(rating) : stat(),
      },
    };
  });
}

// ───────────────── SELECCIÓN PONDERADA ─────────────────

function pickWeightedIndex(rng: Rng, weights: number[]): number {
  const total = weights.reduce((a, w) => a + Math.max(0, w), 0);
  if (total <= 0) return Math.floor(rng() * weights.length);
  let roll = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= Math.max(0, weights[i]);
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

/** Elige goleador: pondera posición, Tiro, rating y un poco de Velocidad. */
function pickScorer(rng: Rng, players: SimPlayer[]): SimPlayer {
  const weights = players.map((p) => {
    const pos = normalizePos(p.pos);
    const posW = GOAL_POS_WEIGHT[pos] ?? 0.6;
    const tiro = safeStat(p, "Tiro");
    const vel = safeStat(p, "Velocidad");
    // Tiro domina, rating acompaña, velocidad influye levemente.
    return (
      posW * (0.6 + tiro / 100) * (0.85 + (p.rating - 70) / 100) * (0.95 + vel / 2000)
    );
  });
  return players[pickWeightedIndex(rng, weights)];
}

/** Elige asistente: favorece MED/MCO/MC/VOL/DEL, nunca el mismo goleador. */
function pickAssist(
  rng: Rng,
  players: SimPlayer[],
  scorer: SimPlayer,
): SimPlayer | null {
  const candidates = players.filter((p) => p.playerId !== scorer.playerId);
  if (candidates.length === 0) return null;

  const weights = candidates.map((p) => {
    const pos = normalizePos(p.pos);
    const posW = ASSIST_POS_WEIGHT[pos] ?? 0.6;
    const pase = safeStat(p, "Pase");
    return posW * (0.5 + pase / 100) * (0.85 + (p.rating - 70) / 100);
  });

  const chosen = candidates[pickWeightedIndex(rng, weights)];
  // El arquero asiste solo de forma extremadamente rara (2%).
  if (normalizePos(chosen.pos) === "POR" && rng() > 0.02) return null;
  return chosen;
}

// ─────────────────── GOLES REALISTAS ───────────────────

/** Poisson aproximada (Knuth); se acota después a un rango realista. */
function sampleGoals(rng: Rng, lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

const clampGoals = (g: number) => clamp(g, 0, 6);

// ───────────────────── SIMULACIÓN ─────────────────────

export function simulateFriendly(input: SimInput): SimResult {
  const { formation, home, rival, seed } = input;
  const rng = mulberry32(seed);

  const away = buildRivalSquad(formation, rival, rng);

  const homeOutfield = home.filter((p) => normalizePos(p.pos) !== "POR");
  const awayOutfield = away.filter((p) => normalizePos(p.pos) !== "POR");

  const homeStrength = computeTeamStrength(home);
  const awayStrength = computeTeamStrength(away);

  // Ventaja leve de local + diferencia de cantidad de jugadores de campo.
  const sizeBonus = (homeOutfield.length - awayOutfield.length) * 0.8;

  // xG: la diferencia ataque vs defensa contraria mueve la expectativa.
  const homeXg = clamp(
    1.2 + (homeStrength.attack - awayStrength.defense) * 0.055 + sizeBonus * 0.05,
    0.25,
    4.2,
  );
  const awayXg = clamp(
    1.2 + (awayStrength.attack - homeStrength.defense) * 0.055 - sizeBonus * 0.05,
    0.2,
    4.0,
  );

  const homeGoals = clampGoals(sampleGoals(rng, homeXg));
  const awayGoals = clampGoals(sampleGoals(rng, awayXg));

  // Goleadores y asistentes de cada equipo.
  const events: SimEvent[] = [];
  const usedMinutes = new Set<number>();
  const takeMinute = (): number => {
    for (let tries = 0; tries < 200; tries++) {
      const m = randInt(rng, 2, 90);
      if (!usedMinutes.has(m)) {
        usedMinutes.add(m);
        return m;
      }
    }
    return 90;
  };

  for (let i = 0; i < homeGoals; i++) {
    const scorers = homeOutfield.length ? homeOutfield : home;
    const scorer = pickScorer(rng, scorers);
    const assist = rng() < 0.62 ? pickAssist(rng, scorers, scorer) : null;
    events.push({
      minute: takeMinute(),
      team: "home",
      type: "goal",
      scorer: scorer.name,
      scorerPlayerId: scorer.playerId,
      assist: assist?.name,
      assistPlayerId: assist?.playerId,
    });
  }

  for (let i = 0; i < awayGoals; i++) {
    const scorers = awayOutfield.length ? awayOutfield : away;
    const scorer = pickScorer(rng, scorers);
    const assist = rng() < 0.5 ? pickAssist(rng, scorers, scorer) : null;
    events.push({
      minute: takeMinute(),
      team: "away",
      type: "goal",
      scorer: scorer.name,
      scorerPlayerId: scorer.playerId,
      assist: assist?.name,
      assistPlayerId: assist?.playerId,
    });
  }

  events.sort((a, b) => a.minute - b.minute);

  // Estadísticas por jugador (para Etapa 3).
  const goalsByPlayer: Record<string, number> = {};
  const assistsByPlayer: Record<string, number> = {};

  for (const e of events) {
    goalsByPlayer[e.scorerPlayerId] = (goalsByPlayer[e.scorerPlayerId] ?? 0) + 1;
    if (e.assistPlayerId) {
      assistsByPlayer[e.assistPlayerId] =
        (assistsByPlayer[e.assistPlayerId] ?? 0) + 1;
    }
  }

  const performances: SimPerformance[] = [...home, ...away].map((p) => {
    const goals = goalsByPlayer[p.playerId] ?? 0;
    const assists = assistsByPlayer[p.playerId] ?? 0;
    return {
      playerId: p.playerId,
      name: p.name,
      pos: normalizePos(p.pos),
      goals,
      assists,
      points: 1 + goals * 3 + assists * 2,
    };
  });

  const outcome: SimOutcome =
    homeGoals > awayGoals
      ? "victoria"
      : homeGoals === awayGoals
        ? "empate"
        : "derrota";

  return {
    homeGoals,
    awayGoals,
    outcome,
    events,
    // Relato puro: usa un stream de RNG SEPARADO derivado de la misma seed,
    // así que no toca el stream de juego y el resultado queda idéntico.
    timeline: buildTimeline({
      home,
      away,
      events,
      homeName: HOME_TEAM_NAME,
      awayName: rival.name,
      dominance: homeStrength.attack - awayStrength.defense,
      rng: mulberry32((seed ^ 0x5f3759df) >>> 0),
    }),
    goalsByPlayer,
    assistsByPlayer,
    performances,
    participants: performances.filter((p) => p.goals > 0 || p.assists > 0)
      .length,
  };
}

/**
 * Recompensa según el resultado (rangos definidos por el proyecto).
 * Se llama UNA sola vez al confirmarse el final del partido.
 */
export function rewardForOutcome(outcome: SimOutcome): number {
  if (outcome === "victoria") return 100 + Math.floor(Math.random() * 61); // 100–160
  if (outcome === "empate") return 65 + Math.floor(Math.random() * 36); // 65–100
  return 30 + Math.floor(Math.random() * 31); // 30–60
}

// ───────────────────── RELATO DINÁMICO ─────────────────────

type TimelineOpts = {
  home: SimPlayer[];
  away: SimPlayer[];
  events: SimEvent[];
  homeName: string;
  awayName: string;
  /** Diferencia de fuerzas (positivo = local superior). */
  dominance: number;
  rng: Rng;
};

/** Peso de pase/creación por posición. */
const PASS_POS: Record<string, number> = {
  POR: 0.1,
  DEF: 0.6,
  VOL: 1.2,
  MC: 1.2,
  MED: 1.4,
  MCO: 1.5,
  DEL: 0.7,
};

/** Peso de remate por posición (para jugadas que no son gol). */
const SHOT_POS: Record<string, number> = {
  POR: 0.02,
  DEF: 0.35,
  VOL: 0.6,
  MC: 0.9,
  MED: 1.0,
  MCO: 1.4,
  DEL: 2.0,
};

/** Peso de recuperación/defensa por posición. */
const RECOVER_POS: Record<string, number> = {
  POR: 0.3,
  DEF: 2.0,
  VOL: 1.4,
  MC: 1.0,
  MED: 0.9,
  MCO: 0.5,
  DEL: 0.4,
};

/** Peso de velocidad (contraataques). */
const SPEED_POS: Record<string, number> = {
  POR: 0.1,
  DEF: 0.8,
  VOL: 1.0,
  MC: 0.9,
  MED: 1.3,
  MCO: 1.2,
  DEL: 1.5,
};

const pickPlayer = (
  rng: Rng,
  players: SimPlayer[],
  w: (p: SimPlayer) => number,
) => players[pickWeightedIndex(rng, players.map(w))];

const wPass = (p: SimPlayer) =>
  (PASS_POS[normalizePos(p.pos)] ?? 0.6) * (0.5 + safeStat(p, "Pase") / 100);
const wShot = (p: SimPlayer) =>
  (SHOT_POS[normalizePos(p.pos)] ?? 0.6) * (0.6 + safeStat(p, "Tiro") / 100);
const wRecover = (p: SimPlayer) => {
  const pos = normalizePos(p.pos);
  const def = p.stats?.Defensa ?? Math.round(p.rating * 0.85);
  return (RECOVER_POS[pos] ?? 0.6) * (0.5 + def / 100);
};
const wSpeed = (p: SimPlayer) =>
  (SPEED_POS[normalizePos(p.pos)] ?? 0.6) * (0.6 + safeStat(p, "Velocidad") / 100);

const pickFrom = <T,>(rng: Rng, list: T[]): T =>
  list[Math.floor(rng() * list.length)];

/**
 * Genera el relato completo del partido (jugadas + comentarios de transmisión
 * + goles) usando los jugadores reales. NO participa en el cálculo del
 * resultado: recibe el partido ya jugado y sólo lo narra.
 */
export function buildTimeline(opts: TimelineOpts): TimelineEvent[] {
  const { home, away, events, homeName, awayName, dominance, rng } = opts;

  const homeOutfield = home.filter((p) => normalizePos(p.pos) !== "POR");
  const awayOutfield = away.filter((p) => normalizePos(p.pos) !== "POR");
  const homeKeeper = home.find((p) => normalizePos(p.pos) === "POR");
  const awayKeeper = away.find((p) => normalizePos(p.pos) === "POR");

  const beats: TimelineEvent[] = [];
  const used = new Set<number>();
  const takeMinute = (m: number) => {
    const clamped = Math.max(1, Math.min(90, m));
    if (!used.has(clamped)) {
      used.add(clamped);
      return clamped;
    }
    for (let d = 1; d <= 4; d++) {
      for (const cand of [clamped - d, clamped + d]) {
        if (cand >= 1 && cand <= 90 && !used.has(cand)) {
          used.add(cand);
          return cand;
        }
      }
    }
    return clamped;
  };

  // Contexto para comentarios: marcador al momento del beat.
  let homeSoFar = 0;
  let awaySoFar = 0;

  const teamName = (t: "home" | "away") => (t === "home" ? homeName : awayName);

  /** Comentario de transmisión según el marcador del momento. */
  const commentFor = (team: "home" | "away", minute: number): TimelineEvent => {
    const diff = homeSoFar - awaySoFar;
    const leading = team === "home" ? diff > 0 : diff < 0;
    const losing = team === "home" ? diff < 0 : diff > 0;
    const strong = team === "home" ? dominance > 4 : dominance < -4;

    let text: string;
    if (losing) {
      text = pickFrom(rng, [
        `${teamName(team)} necesita reaccionar. Sufre en el fondo.`,
        `El partido se le complica a ${teamName(team)}.`,
        `${teamName(team)} va con todo por el empate.`,
      ]);
    } else if (leading && strong) {
      text = pickFrom(rng, [
        `${teamName(team)} tiene amplia ventaja por el bando derecho.`,
        `Trámite cómodo para ${teamName(team)}: toca y toca.`,
        `${teamName(team)} domina el mediocampo, hace todo fácil.`,
      ]);
    } else if (leading) {
      text = pickFrom(rng, [
        `${teamName(team)} se queda con el control del partido.`,
        `Buen momento de ${teamName(team)}. Presiona arriba.`,
      ]);
    } else if (minute < 25) {
      text = pickFrom(rng, [
        "Arranque parejo en Maldonado. Se estudian.",
        "Trámite parejo, partido trabado en el medio.",
      ]);
    } else if (minute > 60) {
      text = pickFrom(rng, [
        "El final se acerca y el resultado sigue abierto.",
        "El mediocampo es una batalla constante.",
        "Nadie se regala: se miden fuerzas en cada pelota.",
      ]);
    } else {
      text = pickFrom(rng, [
        "Partido parejo, gol a gol en Maldonado.",
        "Se vienen minutos calientes en el estadio.",
      ]);
    }
    return { minute, kind: "comentario", team, text };
  };

  // 1) Build-up + gol + reacción, siguiendo los eventos reales.
  for (const goal of events) {
    const attackers = goal.team === "home" ? homeOutfield : awayOutfield;

    if (attackers.length > 0 && goal.minute > 3 && rng() < 0.6) {
      const roll = rng();
      const kind = roll < 0.4 ? "contraataque" : roll < 0.55 ? "centro" : "pase";
      const a = pickPlayer(
        rng,
        attackers,
        kind === "contraataque" ? wSpeed : wPass,
      );
      let b = pickPlayer(rng, attackers, wShot);
      if (b.playerId === a.playerId && attackers.length > 1) {
        b = attackers[(attackers.indexOf(b) + 1) % attackers.length];
      }
      const target = kind === "contraataque" ? b.name : goal.scorer;
      const text =
        kind === "contraataque"
          ? `${a.name} arranca una contra veloz y habilita a ${target}...`
          : kind === "centro"
            ? `${a.name} manda un centro para ${target}...`
            : `${a.name} gambetea y deja solo a ${target}...`;
      beats.push({
        minute: takeMinute(goal.minute - 1 - Math.floor(rng() * 2)),
        kind,
        team: goal.team,
        text,
      });
    }

    // El gol: evento real, intacto.
    const goalBeat: TimelineEvent = {
      minute: goal.minute,
      kind: "goal",
      team: goal.team,
      text: goal.assist
        ? `¡GOOOL de ${teamName(goal.team)}! ${goal.scorer} define perfecto. Asistencia de ${goal.assist}.`
        : `¡GOOOL de ${teamName(goal.team)}! ${goal.scorer} la manda a guardar.`,
      goal,
    };
    if (goal.team === "home") homeSoFar++;
    else awaySoFar++;
    used.add(goal.minute);
    beats.push(goalBeat);

    // Reacción posterior al gol.
    if (goal.minute < 88 && rng() < 0.5) {
      const reactionTeam: "home" | "away" =
        rng() < 0.6 ? goal.team : goal.team === "home" ? "away" : "home";
      beats.push(commentFor(reactionTeam, takeMinute(goal.minute + 1)));
    }
  }

  // 2) Jugadas sueltas contextuales a lo largo del partido.
  const extras = 12 + Math.floor(rng() * 7);
  for (let i = 0; i < extras; i++) {
    const team: "home" | "away" = rng() < 0.52 ? "home" : "away";
    const attackers = team === "home" ? homeOutfield : awayOutfield;
    const keeper = team === "home" ? awayKeeper : homeKeeper; // ataja el arquero rival
    const minute = takeMinute(2 + Math.floor(rng() * 88));
    const rivalName = team === "home" ? awayName : homeName;

    const roll = rng();
    if (keeper && roll < 0.16) {
      const tapada = pickFrom(rng, [
        `Gran tapada de ${keeper.name}.`,
        `${keeper.name} la saca del ángulo. Atajadón.`,
        `Remate peligroso, pero ${keeper.name} responde abajo.`,
      ]);
      beats.push({ minute, kind: "atajada", team, text: tapada });
    } else if (roll < 0.32 && attackers.length > 0) {
      const shooter = pickPlayer(rng, attackers, wShot);
      const wasted = pickFrom(rng, [
        `${shooter.name} remata... ¡desviado!`,
        `¡${shooter.name}, para que te trajeee! La tiró afuera.`,
        `${shooter.name} sacude la red por fuera. Se pierde el golazo.`,
      ]);
      beats.push({ minute, kind: "remate", team, text: wasted });
    } else if (roll < 0.4 && attackers.length > 0) {
      const shooter = pickPlayer(rng, attackers, wShot);
      beats.push({
        minute,
        kind: "palo",
        team,
        text: `¡Al palo! ${shooter.name} remató al travesaño. Se salvó ${rivalName}.`,
      });
    } else if (roll < 0.58) {
      const defenders = team === "home" ? home : away;
      const field = defenders.filter((p) => normalizePos(p.pos) !== "POR");
      if (field.length === 0) continue;
      const a = pickPlayer(rng, field, wRecover);
      const target = attackers.length ? attackers : field;
      const b = pickPlayer(rng, target, wPass);
      const text =
        b.playerId !== a.playerId
          ? pickFrom(rng, [
              `${a.name} recupera y habilita a ${b.name}. Sale limpio.`,
              `Roba ${a.name} en mitad de cancha y entiende el juego: pase para ${b.name}.`,
            ])
          : `${a.name} recupera y corta el avance rival.`;
      beats.push({ minute, kind: "recuperacion", team, text });
    } else if (roll < 0.8 && attackers.length > 1) {
      const a = pickPlayer(rng, attackers, wPass);
      let b = pickPlayer(rng, attackers, wPass);
      if (b.playerId === a.playerId) {
        b = attackers[(attackers.indexOf(a) + 1) % attackers.length];
      }
      const text = pickFrom(rng, [
        `${a.name} toca para ${b.name} y el equipo respira.`,
        `Buena rotación: ${a.name} para ${b.name}. Se estira el rival.`,
        `${a.name} conduce, arrastra marcas y suelta para ${b.name}.`,
      ]);
      beats.push({ minute, kind: "pase", team, text });
    } else {
      beats.push(commentFor(team, minute));
    }
  }

  // Orden estable: minuto, goles primero, luego el orden de creación.
  const seq = beats.map((b, i) => ({ b, i }));
  seq.sort(
    (x, y) =>
      x.b.minute - y.b.minute || prio(x.b.kind) - prio(y.b.kind) || x.i - y.i,
  );
  return seq.map((s) => s.b);
}

/** Los goles van primero en minutos empatados. */
function prio(kind: TimelineKind): number {
  if (kind === "goal") return 0;
  if (kind === "comentario") return 2;
  return 1;
}
