export interface Player {
  id: string;
  name: string;
  photoUrl?: string | null;
  rating?: number | null;
  esDelGrupo: boolean;
}

export interface MatchPlayer {
  playerId: string;
  playerName: string;
  photoUrl?: string | null;
  hasSpecialTag: boolean;
}

export interface Match {
  id: string;
  date: string;
  createdAt: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  teamA: MatchPlayer[];
  teamB: MatchPlayer[];
  ausentes: MatchPlayer[];
}

export interface RankingEntry {
  playerId: string;
  playerName: string;
  photoUrl?: string | null;
  played: number;
  wins: number;
  losses: number;
  winRate: number;
  specialTagCount: number;
  currentStreak: number;
}

export interface MmrEntry {
  playerId: string;
  playerName: string;
  photoUrl?: string | null;
  rank: string;
  mmr: number;
  gamesPlayed: number;
  wins?: number;
  losses?: number;
  draws?: number;
}

export interface AttendanceEntry {
  playerId: string;
  playerName: string;
  photoUrl?: string | null;
  gamesPlayed: number;
  totalMatches: number;
  gamesMissed: number;
  attendanceRate: number;
}

export interface HeadToHead {
  playerAId: string;
  playerAName: string;
  playerAPhotoUrl?: string | null;
  playerBId: string;
  playerBName: string;
  playerBPhotoUrl?: string | null;
  matchesAsRivals: number;
  winsA: number;
  winsB: number;
  ties: number;
  matchesAsTeammates: number;
  winsTogether: number;
  lossesTogether: number;
}

export interface CreateMatchPlayerInput {
  playerId: string;
  hasSpecialTag: boolean;
}
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface CreateMatchInput {
  date: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  teamA: CreateMatchPlayerInput[];
  teamB: CreateMatchPlayerInput[];
  attendance: Array<{ playerId: string; asistio: boolean }>; // <--- Agregá esta línea
}