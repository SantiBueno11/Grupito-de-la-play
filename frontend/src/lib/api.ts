import type { AttendanceEntry, CreateMatchInput, HeadToHead, Match, Player, RankingEntry } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Error ${res.status} llamando a ${path}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
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
    remove: (id: string) => request<void>(`/api/players/${id}`, { method: "DELETE" }),
  },
  matches: {
    list: () => request<Match[]>("/api/matches"),
    ranking: () => request<RankingEntry[]>("/api/matches/ranking"),
    attendance: () => request<AttendanceEntry[]>("/api/matches/attendance"),
    headToHead: (playerAId: string, playerBId: string) =>
      request<HeadToHead>(`/api/matches/head-to-head/${playerAId}/${playerBId}`),
    create: (input: CreateMatchInput) =>
      request<{ id: string }>("/api/matches", { method: "POST", body: JSON.stringify(input) }),
    remove: (id: string) => request<void>(`/api/matches/${id}`, { method: "DELETE" }),
  },
};