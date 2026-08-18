import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { SectionTitle, EmptyState } from "./Shared";
import type { MmrEntry, Player } from "../lib/types";

// Reparte jugadores en 2 equipos lo más parejos posible según su MMR.
// Baraja primero (para variar el resultado cada vez) y después reparte de
// forma golosa: cada jugador va al equipo que hasta ahora tiene menos puntaje.
function balanceTeams(players: Player[], ratingOf: (id: string) => number): [Player[], Player[]] {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  shuffled.sort((a, b) => ratingOf(b.id) - ratingOf(a.id));

  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let sumA = 0;
  let sumB = 0;

  for (const p of shuffled) {
    const r = ratingOf(p.id);
    const goesToA = sumA < sumB || (sumA === sumB && teamA.length <= teamB.length);
    if (goesToA) { teamA.push(p); sumA += r; }
    else { teamB.push(p); sumB += r; }
  }

  return [teamA, teamB];
}

export function Randomizador({ players, mmr }: { players: Player[]; mmr: MmrEntry[] }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(players.map((p) => p.id)));
  const [teams, setTeams] = useState<[Player[], Player[]] | null>(null);

  const ratingOf = (id: string) => mmr.find((m) => m.playerId === id)?.rating ?? 1000;
  const avg = (team: Player[]) => team.length === 0 ? 0 : Math.round(team.reduce((s, p) => s + ratingOf(p.id), 0) / team.length);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const generate = () => {
    const chosen = players.filter((p) => selected.has(p.id));
    setTeams(balanceTeams(chosen, ratingOf));
  };

  if (players.length < 2) {
    return (
      <section>
        <SectionTitle eyebrow="Randomizador" title="Armar equipos aleatorios" />
        <EmptyState text="Necesitás al menos 2 jugadores en el plantel." />
      </section>
    );
  }

  return (
    <section>
      <SectionTitle eyebrow="Randomizador" title="Armar equipos aleatorios" />
      <p className="text-line/40 text-xs mb-3">
        Elegí quién juega hoy y armá dos equipos parejos según el MMR de cada uno.
      </p>

      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto mb-4 border border-line/10 rounded-xl p-2 bg-line/3">
        {players.map((p) => {
          const active = selected.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm"
              style={{
                background: active ? "rgba(212,160,23,0.15)" : "transparent",
                opacity: active ? 1 : 0.4,
              }}
            >
              <Avatar name={p.name} photoUrl={p.photoUrl} size={26} ring={active ? "#D4A017" : null} />
              <span className="flex-1 font-semibold">{p.name}</span>
              <span className="font-mono text-xs text-gold-soft">{ratingOf(p.id)}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={generate}
        disabled={selected.size < 2}
        className="w-full flex items-center justify-center gap-1.5 bg-win text-pitch-ink rounded-lg py-2.5 font-bold text-sm disabled:opacity-40 mb-5"
      >
        <Shuffle size={16} /> {teams ? "Generar de nuevo" : "Generar equipos"}
      </button>

      {teams && (
        <div className="grid grid-cols-2 gap-3.5">
          {teams.map((team, i) => (
            <div key={i} className="border border-line/12 rounded-xl p-3 bg-line/3">
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="font-display font-semibold text-sm"
                  style={{ color: i === 0 ? "#5EDB8C" : "#3498DB" }}
                >
                  Equipo {i === 0 ? "A" : "B"}
                </span>
                <Chip tone="gold">{avg(team)} MMR prom.</Chip>
              </div>
              <div className="flex flex-col gap-1.5">
                {team.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Avatar name={p.name} photoUrl={p.photoUrl} size={22} />
                    <span className="text-sm">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}