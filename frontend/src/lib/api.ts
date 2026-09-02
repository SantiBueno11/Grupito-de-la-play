import type {
  AttendanceEntry,
  CreateMatchInput,
  HeadToHead,
  Match,
  MmrEntry,
  Player,
  RankingEntry,
  Badge,
} from "./types";

export interface AuthResponse {
  message: string;
  username?: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "https://grupito-de-la-play.onrender.com";
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? body?.message ?? `Error ${res.status} llamando a ${path}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface GroupSettings {
  name: string;
  description: string;
  photoUrl: string;
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    register: (username: string, password: string) =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
  },
  players: {
    list: () => request<Player[]>("/api/players"),
    create: (name: string) =>
      request<Player>("/api/players", { method: "POST", body: JSON.stringify({ name }) }),
    updatePhoto: (id: string, photoUrl: string | null) =>
      request<void>(`/api/players/${id}/photo`, { method: "PUT", body: JSON.stringify({ photoUrl }) }),
    updateName: (id: string, name: string) =>
      request<void>(`/api/players/${id}/name`, { method: "PUT", body: JSON.stringify({ name }) }),
    updateRating: (id: string, rating: number | null) =>
      request<void>(`/api/players/${id}/rating`, { method: "PUT", body: JSON.stringify({ rating }) }),
    updateEsDelGrupo: (id: string, esDelGrupo: boolean) =>
      request<void>(`/api/players/${id}/es-del-grupo`, { method: "PUT", body: JSON.stringify({ esDelGrupo }) }),
    badges: (id: string) => request<Badge[]>(`/api/players/${id}/badges`),
    remove: (id: string) => request<void>(`/api/players/${id}`, { method: "DELETE" }),
  },
  matches: {
    mmr: () => request<MmrEntry[]>("/api/matches/mmr"),
    list: () => request<Match[]>("/api/matches"),
    ranking: () => request<RankingEntry[]>("/api/matches/ranking"),
    attendance: () => request<AttendanceEntry[]>("/api/matches/attendance"),
    headToHead: (playerAId: string, playerBId: string) =>
      request<HeadToHead>(`/api/matches/head-to-head/${playerAId}/${playerBId}`),
    create: (input: CreateMatchInput) =>
      request<{ id: string }>("/api/matches", { method: "POST", body: JSON.stringify(input) }),
    remove: (id: string) => request<void>(`/api/matches/${id}`, { method: "DELETE" }),
  },
  settings: {
    get: () => request<GroupSettings>("/api/settings"),
    update: (data: GroupSettings) =>
      request<GroupSettings>("/api/settings", { method: "PUT", body: JSON.stringify(data) }),
  },
  dashboard: {
    get: () => request<{
      players: Player[];
      matches: Match[];
      ranking: RankingEntry[];
      attendance: AttendanceEntry[];
      mmr: MmrEntry[];
      settings: GroupSettings;
    }>("/api/dashboard"),
  }
};
