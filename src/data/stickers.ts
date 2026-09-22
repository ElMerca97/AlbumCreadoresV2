export type Rarity = "COMÚN" | "ÉPICO" | "80'S" | "MODO DIOS" | "ALTERNATIVA" | "ESCUDO" | "COURT";

export type Stats = {
  Pase: number;
  Tiro: number;
  Defensa: number;
  Velocidad: number;
  Regate: number;
  Físico: number;
};

export type Sticker = {
  id: number;
  playerId: string;
  name: string;
  version: string;
  rarity: Rarity;
  image: string;
  quote: string;
  pos?: string;
  team?: string;
  number?: number;
  rating?: number;
  stats?: Stats;
  type?: "club" | "court";
  club?: string;
};

export const STAT_KEYS = ["Pase", "Tiro", "Defensa", "Velocidad", "Regate", "Físico"] as const;

const TEAM = "Selección de Maldonado";

export const stickers: Sticker[] = [
  // ───────────────────────── VERSION COMÚN ─────────────────────────
  { id: 1, playerId: "Morron", name: "Morron", pos: "POR", team: TEAM, number: 26, version: "VERSION COMÚN", rarity: "COMÚN", rating: 72, image: "images/stickers/Comun/MorronComun.png", quote: "Un muro bajo los tres palos.", stats: { Pase: 40, Tiro: 30, Defensa: 60, Velocidad: 50, Regate: 45, Físico: 70 } },
  { id: 3, playerId: "Andres", name: "Andres 'Peti' Rivero", pos: "DEF", team: TEAM, number: 3, version: "VERSION COMÚN", rarity: "COMÚN", rating: 72, image: "images/stickers/Comun/AndresComun.png", quote: "Firme atrás, siempre listo para la batalla.", stats: { Pase: 72, Tiro: 70, Defensa: 68, Velocidad: 74, Regate: 73, Físico: 75 } },
  { id: 5, playerId: "Cundoo", name: "Cundoo", pos: "MED", team: TEAM, number: 5, version: "VERSION COMÚN", rarity: "COMÚN", rating: 78, image: "images/stickers/Comun/CundoComun.png", quote: "Más que fútbol, creamos historias.", stats: { Pase: 78, Tiro: 65, Defensa: 70, Velocidad: 72, Regate: 75, Físico: 68 } },
  { id: 6, playerId: "Matute", name: "Matute", pos: "DEF", team: TEAM, number: 6, version: "VERSION COMÚN", rarity: "COMÚN", rating: 73, image: "images/stickers/Comun/MatuteComun.png", quote: "Donde otros ven peligro, él ve una oportunidad.", stats: { Pase: 73, Tiro: 66, Defensa: 68, Velocidad: 71, Regate: 72, Físico: 69 } },
  { id: 7, playerId: "Seba", name: "Seba 'Stithc' Sasia", pos: "VOL", team: TEAM, number: 7, version: "VERSION COMÚN", rarity: "COMÚN", rating: 70, image: "images/stickers/Comun/SebaComun.png", quote: "Corazón, garra y fútbol hasta el final.", stats: { Pase: 68, Tiro: 60, Defensa: 74, Velocidad: 68, Regate: 66, Físico: 72 } },
  { id: 9, playerId: "Manu Rodriguez", name: "Manu 'Pocho' Rodriguez", pos: "DEL", team: TEAM, number: 8, version: "VERSION COMÚN", rarity: "COMÚN", rating: 75, image: "images/stickers/Comun/ManuRodriguezComun.png", quote: "Maldonado siempre crea.", stats: { Pase: 76, Tiro: 78, Defensa: 60, Velocidad: 76, Regate: 80, Físico: 72 } },
  { id: 10, playerId: "Sangaraza", name: "Sangaraza", pos: "MCO", team: TEAM, number: 10, version: "VERSION COMÚN", rarity: "COMÚN", rating: 78, image: "images/stickers/Comun/SangarazaComun.png", quote: "Creamos y jugamos.", stats: { Pase: 78, Tiro: 72, Defensa: 68, Velocidad: 76, Regate: 80, Físico: 74 } },
  { id: 11, playerId: "Aarón", name: "Aarón", pos: "VOL", team: TEAM, number: 11, version: "VERSION COMÚN", rarity: "COMÚN", rating: 72, image: "images/stickers/Comun/AarónComun.png", quote: "El equilibrio perfecto entre esfuerzo y talento.", stats: { Pase: 72, Tiro: 68, Defensa: 66, Velocidad: 73, Regate: 74, Físico: 70 } },
  { id: 12, playerId: "Rolangas", name: "Rolangas", pos: "MED", team: TEAM, number: 69, version: "VERSION COMÚN", rarity: "COMÚN", rating: 78, image: "images/stickers/Comun/RolangasComun.png", quote: "Maldonado siempre crea.", stats: { Pase: 80, Tiro: 75, Defensa: 68, Velocidad: 78, Regate: 82, Físico: 74 } },
  { id: 13, playerId: "Cristian", name: "Cristian 'Bufalo' Mendez", pos: "DEF", team: TEAM, number: 13, version: "VERSION COMÚN", rarity: "COMÚN", rating: 71, image: "images/stickers/Comun/CristianComun.png", quote: "La fuerza también juega.", stats: { Pase: 70, Tiro: 68, Defensa: 66, Velocidad: 72, Regate: 71, Físico: 69 } },
  { id: 16, playerId: "Nahuel", name: "Nahuel", pos: "MED", team: TEAM, number: 16, version: "VERSION COMÚN", rarity: "COMÚN", rating: 74, image: "images/stickers/Comun/NahuelComun.png", quote: "Pensar rápido, jugar mejor.", stats: { Pase: 75, Tiro: 70, Defensa: 68, Velocidad: 74, Regate: 75, Físico: 72 } },
  { id: 17, playerId: "Mato", name: "Mato Cal", pos: "DEF", team: TEAM, number: 369, version: "VERSION COMÚN", rarity: "COMÚN", rating: 71, image: "images/stickers/Comun/MatoComun.png", quote: "Cuando hay que meter, se mete.", stats: { Pase: 46, Tiro: 34, Defensa: 60, Velocidad: 66, Regate: 54, Físico: 70 } },
  { id: 18, playerId: "Jona", name: "Jona", pos: "VOL", team: TEAM, number: 18, version: "VERSION COMÚN", rarity: "COMÚN", rating: 73, image: "images/stickers/Comun/JonaComun.png", quote: "Siempre dejando todo por la camiseta.", stats: { Pase: 71, Tiro: 74, Defensa: 63, Velocidad: 74, Regate: 72, Físico: 69 } },
  { id: 19, playerId: "Agus", name: "Agustin Severo", pos: "VOL", team: TEAM, number: 99, version: "VERSION COMÚN", rarity: "COMÚN", rating: 72, image: "images/stickers/Comun/AgusComun.png", quote: "Trabajo, sacrificio y fútbol.", stats: { Pase: 72, Tiro: 68, Defensa: 66, Velocidad: 73, Regate: 71, Físico: 70 } },
  { id: 20, playerId: "ElMerca", name: "ElMerca", pos: "DEF", team: TEAM, number: 40, version: "VERSION COMÚN", rarity: "COMÚN", rating: 71, image: "images/stickers/Comun/ElMercaComun.png", quote: "El equipo siempre está primero.", stats: { Pase: 68, Tiro: 62, Defensa: 73, Velocidad: 69, Regate: 67, Físico: 71 } },

  // ───────────────────────── VERSION ÉPICO ─────────────────────────
  { id: 21, playerId: "Morron", name: "Morron", pos: "POR", team: TEAM, number: 26, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 86, image: "images/stickers/Legends/MorronLegends.png", quote: "En el arco, no pasa nadie.", stats: { Pase: 55, Tiro: 48, Defensa: 78, Velocidad: 70, Regate: 65, Físico: 84 } },
  { id: 23, playerId: "Andres", name: "Andres 'Peti' Rivero", pos: "DEF", team: TEAM, number: 3, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 84, image: "images/stickers/Legends/AndresLegends.png", quote: "Cuando llega el momento, aparece.", stats: { Pase: 84, Tiro: 82, Defensa: 80, Velocidad: 85, Regate: 84, Físico: 89 } },
  { id: 25, playerId: "Cundoo", name: "Cundoo", pos: "MED", team: TEAM, number: 5, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 88, image: "images/stickers/Legends/CundoLegends.png", quote: "Más que fútbol, creamos historias.", stats: { Pase: 86, Tiro: 76, Defensa: 80, Velocidad: 84, Regate: 85, Físico: 80 } },
  { id: 26, playerId: "Nahuel", name: "Nahuel", pos: "MC", team: TEAM, number: 16, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 85, image: "images/stickers/Legends/NahuelLegends.png", quote: "La cabeza siempre un segundo por delante.", stats: { Pase: 83, Tiro: 77, Defensa: 79, Velocidad: 82, Regate: 84, Físico: 81 } },
  { id: 27, playerId: "Seba", name: "Seba 'Stithc' Sasia", pos: "VOL", team: TEAM, number: 7, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 84, image: "images/stickers/Legends/SebaLegends.png", quote: "La camiseta se defiende hasta el último segundo.", stats: { Pase: 78, Tiro: 70, Defensa: 85, Velocidad: 79, Regate: 77, Físico: 84 } },
  { id: 29, playerId: "Manu Rodriguez", name: "Manu 'Pocho' Rodriguez", pos: "DEL", team: TEAM, number: 8, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 88, image: "images/stickers/Legends/ManuLegends.png", quote: "Si hay un espacio, encuentra el camino al gol.", stats: { Pase: 85, Tiro: 88, Defensa: 72, Velocidad: 87, Regate: 91, Físico: 82 } },
  { id: 30, playerId: "Sangaraza", name: "Sangaraza", pos: "MCO", team: TEAM, number: 10, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 92, image: "images/stickers/Legends/SangarazaLegends.png", quote: "Maldonado siempre crea.", stats: { Pase: 91, Tiro: 87, Defensa: 80, Velocidad: 86, Regate: 91, Físico: 85 } },
  { id: 31, playerId: "Aarón", name: "Aarón", pos: "VOL", team: TEAM, number: 11, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 85, image: "images/stickers/Legends/AarónLegends.png", quote: "El motor que nunca deja de funcionar.", stats: { Pase: 82, Tiro: 78, Defensa: 77, Velocidad: 83, Regate: 84, Físico: 81 } },
  { id: 32, playerId: "Rolangas", name: "Rolangas", pos: "MED", team: TEAM, number: 69, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 92, image: "images/stickers/Legends/RolangasLegends.png", quote: "Maldonado siempre crea.", stats: { Pase: 91, Tiro: 87, Defensa: 80, Velocidad: 88, Regate: 92, Físico: 86 } },
  { id: 33, playerId: "Cristian", name: "Cristian 'Bufalo' Mendez", pos: "DEF", team: TEAM, number: 13, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 84, image: "images/stickers/Legends/CristianLegends.png", quote: "Fuerza, presencia y carácter en cada duelo.", stats: { Pase: 80, Tiro: 78, Defensa: 77, Velocidad: 82, Regate: 80, Físico: 79 } },
  { id: 36, playerId: "Matute", name: "Matute", pos: "DEF", team: TEAM, number: 6, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 86, image: "images/stickers/Legends/MatuteLegends.png", quote: "Siempre preparado para dar el golpe justo.", stats: { Pase: 85, Tiro: 80, Defensa: 79, Velocidad: 84, Regate: 85, Físico: 83 } },
  { id: 37, playerId: "Mato", name: "Mato Cal", pos: "DEF", team: TEAM, number: 17, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 84, image: "images/stickers/Legends/MatoLegends.png", quote: "El esfuerzo no se negocia.", stats: { Pase: 61, Tiro: 48, Defensa: 78, Velocidad: 81, Regate: 72, Físico: 84 } },
  { id: 38, playerId: "Jona", name: "Jona", pos: "VOL", team: TEAM, number: 18, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 85, image: "images/stickers/Legends/JonaLegends.png", quote: "Cuando el partido aprieta, aparece su mejor versión.", stats: { Pase: 82, Tiro: 86, Defensa: 75, Velocidad: 86, Regate: 84, Físico: 80 } },
  { id: 39, playerId: "Agus", name: "Agustin Severo", pos: "VOL", team: TEAM, number: 99, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 85, image: "images/stickers/Legends/AgusLegends.png", quote: "Talento y sacrificio en partes iguales.", stats: { Pase: 82, Tiro: 78, Defensa: 77, Velocidad: 83, Regate: 81, Físico: 82 } },
  { id: 40, playerId: "ElMerca", name: "ElMerca", pos: "DEF", team: TEAM, number: 40, version: "VERSION ÉPICO", rarity: "ÉPICO", rating: 84, image: "images/stickers/Legends/ElMercaLegends.png", quote: "El trabajo silencioso también gana partidos.", stats: { Pase: 79, Tiro: 73, Defensa: 84, Velocidad: 81, Regate: 78, Físico: 83 } },

  // ───────────────────────── VERSION 80'S ─────────────────────────
  { id: 43, playerId: "Andres", name: "Andres 'Peti' Rivero", pos: "DEF", team: TEAM, number: 3, version: "VERSION 80'S", rarity: "80'S", rating: 92, image: "images/stickers/80's/Andres80.png", quote: "Clase, velocidad y carácter en cada pelota.", stats: { Pase: 92, Tiro: 90, Defensa: 88, Velocidad: 94, Regate: 93, Físico: 95 } },
  { id: 45, playerId: "Cundoo", name: "Cundoo", pos: "MED", team: TEAM, number: 5, version: "VERSION 80'S", rarity: "80'S", rating: 94, image: "images/stickers/80's/Cundo80.png", quote: "Más que fútbol, creamos historias.", stats: { Pase: 91, Tiro: 83, Defensa: 86, Velocidad: 88, Regate: 91, Físico: 87 } },
  { id: 46, playerId: "Nahuel", name: "Nahuel", pos: "MC", team: TEAM, number: 16, version: "VERSION 80'S", rarity: "80'S", rating: 92, image: "images/stickers/80's/Nahuel80.png", quote: "Elegancia y precisión en el mediocampo.", stats: { Pase: 88, Tiro: 83, Defensa: 84, Velocidad: 87, Regate: 88, Físico: 86 } },
  { id: 47, playerId: "Seba", name: "Seba 'Stithc' Sasia", pos: "VOL", team: TEAM, number: 7, version: "VERSION 80'S", rarity: "80'S", rating: 93, image: "images/stickers/80's/Seba80.png", quote: "Garra, fuerza y fútbol de barrio.", stats: { Pase: 83, Tiro: 78, Defensa: 92, Velocidad: 84, Regate: 82, Físico: 89 } },
  { id: 49, playerId: "Manu Rodriguez", name: "Manu 'Pocho' Rodriguez", pos: "DEL", team: TEAM, number: 8, version: "VERSION 80'S", rarity: "80'S", rating: 95, image: "images/stickers/80's/Manu80.png", quote: "Velocidad, potencia y gol. Una amenaza constante.", stats: { Pase: 96, Tiro: 94, Defensa: 88, Velocidad: 96, Regate: 98, Físico: 98 } },
  { id: 50, playerId: "Sangaraza", name: "Sangaraza", pos: "MCO", team: TEAM, number: 10, version: "VERSION 80'S", rarity: "80'S", rating: 96, image: "images/stickers/80's/Sangaraza80.png", quote: "Maldonado siempre crea.", stats: { Pase: 94, Tiro: 97, Defensa: 84, Velocidad: 90, Regate: 96, Físico: 92 } },
  { id: 52, playerId: "Rolangas", name: "Rolangas", pos: "MED", team: TEAM, number: 69, version: "VERSION 80'S", rarity: "80'S", rating: 96, image: "images/stickers/80's/Rolangas80.png", quote: "Maldonado siempre crea.", stats: { Pase: 95, Tiro: 92, Defensa: 84, Velocidad: 93, Regate: 97, Físico: 91 } },
  { id: 56, playerId: "Matute", name: "Matute", pos: "DEF", team: TEAM, number: 6, version: "VERSION 80'S", rarity: "80'S", rating: 93, image: "images/stickers/80's/Matute80.png", quote: "Un defensor con alma de guerrero.", stats: { Pase: 90, Tiro: 85, Defensa: 84, Velocidad: 88, Regate: 90, Físico: 88 } },
  { id: 60, playerId: "ElMerca", name: "ElMerca", pos: "DEF", team: TEAM, number: 40, version: "VERSION 80'S", rarity: "80'S", rating: 91, image: "images/stickers/80's/ElMerca80.png", quote: "Experiencia, carácter y sacrificio por la camiseta.", stats: { Pase: 84, Tiro: 80, Defensa: 91, Velocidad: 85, Regate: 81, Físico: 88 } },

  // ───────────────────────── MODO DIOS ─────────────────────────
  { id: 61, playerId: "Morron", name: "Morron", pos: "POR", team: TEAM, number: 26, version: "MODO DIOS", rarity: "MODO DIOS", rating: 99, image: "images/stickers/Dios/MorronDios.png", quote: "Cuando el arco parece imposible, él lo hace parecer sencillo.", stats: { Pase: 88, Tiro: 82, Defensa: 97, Velocidad: 94, Regate: 91, Físico: 98 } },
  { id: 63, playerId: "Andres", name: "Andres 'Peti' Rivero", pos: "DEF", team: TEAM, number: 3, version: "MODO DIOS", rarity: "MODO DIOS", rating: 101, image: "images/stickers/Dios/AndresDios.png", quote: "Cuando juega en modo Dios, defender parece demasiado fácil.", stats: { Pase: 101, Tiro: 99, Defensa: 98, Velocidad: 103, Regate: 102, Físico: 103 } },
  { id: 65, playerId: "Cundoo", name: "Cundoo", pos: "MED", team: TEAM, number: 5, version: "MODO DIOS", rarity: "MODO DIOS", rating: 99, image: "images/stickers/Dios/CundoDios.png", quote: "Más que fútbol, creamos historias.", stats: { Pase: 99, Tiro: 94, Defensa: 96, Velocidad: 97, Regate: 99, Físico: 95 } },
  { id: 66, playerId: "Nahuel", name: "Nahuel", pos: "MC", team: TEAM, number: 16, version: "MODO DIOS", rarity: "MODO DIOS", rating: 98, image: "images/stickers/Dios/NahuelDios.png", quote: "Cuando piensa el juego, el resto simplemente lo sigue.", stats: { Pase: 97, Tiro: 93, Defensa: 95, Velocidad: 96, Regate: 98, Físico: 94 } },
  { id: 69, playerId: "Manu Rodriguez", name: "Manu 'Pocho' Rodriguez", pos: "DEL", team: TEAM, number: 8, version: "MODO DIOS", rarity: "MODO DIOS", rating: 99, image: "images/stickers/Dios/ManuDios.png", quote: "Cuando arranca, solo queda mirar.", stats: { Pase: 98, Tiro: 99, Defensa: 88, Velocidad: 99, Regate: 99, Físico: 94 } },
  { id: 70, playerId: "Sangaraza", name: "Sangaraza", pos: "MCO", team: TEAM, number: 10, version: "MODO DIOS", rarity: "MODO DIOS", rating: 99, image: "images/stickers/Dios/SanGarazaDios.png", quote: "Maldonado siempre crea.", stats: { Pase: 100, Tiro: 100, Defensa: 97, Velocidad: 100, Regate: 100, Físico: 97 } },
  { id: 72, playerId: "Rolangas", name: "Rolangas", pos: "MED", team: TEAM, number: 69, version: "MODO DIOS", rarity: "MODO DIOS", rating: 99, image: "images/stickers/Dios/RolangasDios.png", quote: "Maldonado siempre crea.", stats: { Pase: 99, Tiro: 98, Defensa: 94, Velocidad: 99, Regate: 99, Físico: 98 } },
  { id: 73, playerId: "Cristian", name: "Cristian 'Bufalo' Mendez", pos: "DEF", team: TEAM, number: 13, version: "MODO DIOS", rarity: "MODO DIOS", rating: 97, image: "images/stickers/Dios/CristianDios.png", quote: "Una fuerza imposible de ignorar.", stats: { Pase: 95, Tiro: 93, Defensa: 93, Velocidad: 96, Regate: 95, Físico: 94 } },
  { id: 76, playerId: "Matute", name: "Matute", pos: "DEF", team: TEAM, number: 6, version: "MODO DIOS", rarity: "MODO DIOS", rating: 98, image: "images/stickers/Dios/MatuteDios.png", quote: "No hay duelo que no esté dispuesto a ganar.", stats: { Pase: 98, Tiro: 94, Defensa: 94, Velocidad: 97, Regate: 98, Físico: 96 } },
  { id: 78, playerId: "Jona", name: "Jona", pos: "VOL", team: TEAM, number: 18, version: "MODO DIOS", rarity: "MODO DIOS", rating: 98, image: "images/stickers/Dios/JonaDios.png", quote: "Cuando el partido exige grandeza, responde.", stats: { Pase: 96, Tiro: 99, Defensa: 91, Velocidad: 98, Regate: 97, Físico: 94 } },
  { id: 79, playerId: "Agus", name: "Agustin Severo", pos: "VOL", team: TEAM, number: 99, version: "MODO DIOS", rarity: "MODO DIOS", rating: 98, image: "images/stickers/Dios/AgusDios.png", quote: "Talento que aparece cuando más se necesita.", stats: { Pase: 97, Tiro: 93, Defensa: 93, Velocidad: 97, Regate: 95, Físico: 95 } },
  { id: 80, playerId: "ElMerca", name: "ElMerca", pos: "DEF", team: TEAM, number: 40, version: "MODO DIOS", rarity: "MODO DIOS", rating: 98, image: "images/stickers/Dios/ElMercaDios.png", quote: "Cuando hay que defender el escudo, no existe el cansancio.", stats: { Pase: 94, Tiro: 90, Defensa: 99, Velocidad: 95, Regate: 91, Físico: 97 } },

  // ───────────────────────── ALTERNATIVA ─────────────────────────
  { id: 90, playerId: "Sangaraza", name: "Sangaraza", pos: "POR", team: TEAM, number: 10, version: "ALTERNATIVA", rarity: "ALTERNATIVA", rating: 99, image: "images/stickers/Alternative/AlternativeSangaraza.png", quote: "Maldonado siempre crea.", stats: { Pase: 100, Tiro: 100, Defensa: 97, Velocidad: 100, Regate: 100, Físico: 97 } },
  { id: 94, playerId: "Mato", name: "Mato Cal", pos: "DEL", team: TEAM, number: 369, version: "ALTERNATIVA", rarity: "ALTERNATIVA", rating: 98, image: "images/stickers/Alternative/AlternativeMato.png", quote: "Cuando aparece el espacio, no perdona.", stats: { Pase: 96, Tiro: 99, Defensa: 90, Velocidad: 99, Regate: 97, Físico: 94 } },

  // ───────────────────────── ESCUDOS ─────────────────────────
  { id: 100, playerId: "FC Carolino", name: "FC Carolino", type: "club", club: "FC Carolino", version: "ESCUDOS", rarity: "ESCUDO", image: "images/Clubes/FCCarolino.png", quote: "La pasión también se lleva en el escudo." },
  { id: 101, playerId: "Chiveo", name: "Chiveo Fútbol Club", type: "club", club: "Chiveo Fútbol Club", version: "ESCUDOS", rarity: "ESCUDO", image: "images/Clubes/Chiveo.png", quote: "Un escudo representa mucho más que un equipo." },
  { id: 102, playerId: "SeleccionMaldonadoCreadores", name: "Selección de Maldonado de Creadores", type: "club", club: "Selección de Maldonado de Creadores", version: "ESCUDOS", rarity: "ESCUDO", image: "images/Clubes/SeleccionMaldonadoCreadores.png", quote: "Donde el fútbol y la creación se encuentran." },
  { id: 103, playerId: "Mazzoni", name: "Mazzoni FC", type: "club", club: "Mazzoni FC", version: "ESCUDOS", rarity: "ESCUDO", image: "images/Clubes/Mazzoni.png", quote: "Un escudo, una identidad." },
  { id: 104, playerId: "Sacachispas", name: "Sacachispas FC", type: "club", club: "Sacachispas FC", version: "ESCUDOS", rarity: "ESCUDO", image: "images/Clubes/Sacachispas.png", quote: "Pasión que se lleva en cada partido." },
  { id: 105, playerId: "Presion", name: "Presión", type: "club", club: "Presión", version: "ESCUDOS", rarity: "ESCUDO", image: "images/Clubes/Presion.png", quote: "La presión también forma parte del juego." },
  { id: 106, playerId: "Vikingos", name: "Vikingos", type: "club", club: "Vikingos", version: "ESCUDOS", rarity: "ESCUDO", image: "images/Clubes/Vikingos.png", quote: "Fuerza, identidad y pasión." },

  // ───────────────────────── CANCHAS ─────────────────────────
  {
    id: 200,
    playerId: "CanchaLiffa",
    name: "Cancha Liffa",
    version: "COURT",
    rarity: "COURT",
    image: "/images/Cancha/CanchaLiffa.png",
    quote: "Calidad garantizada y el mejor 3er tiempo.",
    type: "court",
  },
];

/** Colecciones (secciones del álbum) en orden. */
export const SECTIONS: { version: string; short: string; blurb: string }[] = [
  { version: "VERSION COMÚN", short: "COMÚN", blurb: "La base del álbum. Todos arrancan acá." },
  { version: "VERSION ÉPICO", short: "ÉPICO", blurb: "Leyendas modernas de Maldonado." },
  { version: "VERSION 80'S", short: "80'S", blurb: "Fútbol retro, garra y VHS." },
  { version: "MODO DIOS", short: "MODO DIOS", blurb: "El nivel más alto del universo." },
  { version: "ALTERNATIVA", short: "ALTERNATIVA", blurb: "Versiones paralelas e imposibles." },
  { version: "ESCUDOS", short: "ESCUDOS", blurb: "Los clubes y sus identidades." },
  { version: "COURT", short: "CANCHAS", blurb: "Especiales del álbum." },
];

export const bySection = (version: string) => stickers.filter((s) => s.version === version);

export const COURT_STICKER_ID = 200;
export const COURT_STICKERS = stickers.filter((s) => s.type === "court");
export const PLAYABLE_STICKERS = stickers.filter((s) => s.type !== "court");

export const CANCHA_LIFFA_ID = COURT_STICKER_ID;

export const CANCHA_LIFFA: Sticker = stickers.find((s) => s.id === COURT_STICKER_ID)!;

