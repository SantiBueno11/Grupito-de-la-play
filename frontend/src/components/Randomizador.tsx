import { useState } from "react";
import { Shuffle, Star } from "lucide-react";
import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { SectionTitle, EmptyState } from "./Shared";
import type { Player } from "../lib/types";

function effectiveRating(player: Player) {
  return player.rating ?? 3;
}

function balanceTeams(players: Player[]): [Player[], Player[]] {
  const shuffled = [...players];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  shuffled.sort(
    (a, b) =>
      effectiveRating(b) -
      effectiveRating(a),
  );

  const teamA: Player[] = [];
  const teamB: Player[] = [];

  let sumA = 0;
  let sumB = 0;

  for (const player of shuffled) {
    const rating = effectiveRating(player);

    const goesToA =
      sumA < sumB ||
      (sumA === sumB &&
        teamA.length <= teamB.length);

    if (goesToA) {
      teamA.push(player);
      sumA += rating;
    } else {
      teamB.push(player);
      sumB += rating;
    }
  }

  return [teamA, teamB];
}

function averageRating(team: Player[]) {
  if (team.length === 0) {
    return 0;
  }

  const total = team.reduce(
    (sum, player) =>
      sum + effectiveRating(player),
    0,
  );

  return total / team.length;
}

export function Randomizador({
  players,
}: {
  players: Player[];
}) {
  const [selected, setSelected] =
    useState<Set<string>>(
      () =>
        new Set(
          players.map((player) => player.id),
        ),
    );

  const [teams, setTeams] = useState<
    [Player[], Player[]] | null
  >(null);

  const toggle = (id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const generate = () => {
    const selectedPlayers = players.filter(
      (player) => selected.has(player.id),
    );

    setTeams(balanceTeams(selectedPlayers));
  };

  if (players.length < 2) {
    return (
      <section>
        <SectionTitle
          eyebrow="Randomizador"
          title="Armar equipos aleatorios"
        />

        <EmptyState text="Necesitás al menos 2 jugadores en el plantel." />
      </section>
    );
  }

  return (
    <section>
      <SectionTitle
        eyebrow="Randomizador"
        title="Armar equipos aleatorios"
      />

      <p className="mb-3 text-xs text-line/40">
        Elegí quién juega hoy y armá dos equipos
        parejos según las estrellas manuales de cada
        jugador.
      </p>

      <div className="mb-4 flex max-h-64 flex-col gap-1.5 overflow-y-auto rounded-xl border border-line/10 bg-line/3 p-2">
        {players.map((player) => {
          const active = selected.has(player.id);

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => toggle(player.id)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm"
              style={{
                background: active
                  ? "rgba(212,160,23,0.15)"
                  : "transparent",
                opacity: active ? 1 : 0.4,
              }}
            >
              <Avatar
                name={player.name}
                photoUrl={player.photoUrl}
                size={26}
                ring={active ? "#D4A017" : null}
              />

              <span className="flex-1 font-semibold">
                {player.name}
              </span>

              <span className="flex items-center gap-0.5 text-gold-soft">
                <Star
                  size={11}
                  fill="#D4A017"
                  color="#D4A017"
                />

                <span className="font-mono text-xs">
                  {effectiveRating(player)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={selected.size < 2}
        className="mb-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-win py-2.5 text-sm font-bold text-pitch-ink disabled:opacity-40"
      >
        <Shuffle size={16} />

        {teams
          ? "Generar de nuevo"
          : "Generar equipos"}
      </button>

      {teams && (
        <div className="grid grid-cols-2 gap-3.5">
          {teams.map((team, index) => (
            <div
              key={index}
              className="rounded-xl border border-line/12 bg-line/3 p-3"
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span
                  className="font-display text-sm font-semibold"
                  style={{
                    color:
                      index === 0
                        ? "#5EDB8C"
                        : "#3498DB",
                  }}
                >
                  Equipo {index === 0 ? "A" : "B"}
                </span>

                <Chip tone="gold">
                  {averageRating(team).toFixed(1)} prom.
                </Chip>
              </div>

              <div className="flex flex-col gap-1.5">
                {team.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2"
                  >
                    <Avatar
                      name={player.name}
                      photoUrl={player.photoUrl}
                      size={22}
                    />

                    <span className="text-sm">
                      {player.name}
                    </span>
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