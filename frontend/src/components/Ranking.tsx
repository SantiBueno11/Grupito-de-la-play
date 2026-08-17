import { Flame, Snowflake } from "lucide-react";
import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { SectionTitle, EmptyState } from "./Shared";
import type { MmrEntry, RankingEntry } from "../lib/types";

function StreakChip({ streak }: { streak: number }) {
  if (streak === 0) return null;

  const isWin = streak > 0;

  return (
    <Chip tone={isWin ? "win" : "loss"}>
      <span className="inline-flex items-center gap-1">
        {isWin ? <Flame size={11} /> : <Snowflake size={11} />}
        {Math.abs(streak)}
      </span>
    </Chip>
  );
}

export function Ranking({
  stats,
  mmr,
}: {
  stats: RankingEntry[];
  mmr: MmrEntry[];
}) {
  if (stats.length === 0 && mmr.length === 0) {
    return (
      <section>
        <SectionTitle
          eyebrow="Tabla"
          title="Ranking de la semana"
        />

        <EmptyState text="Todavía no hay partidos cargados para armar el ranking." />
      </section>
    );
  }

  const podium = stats.slice(0, 3);
  const podiumOrder = [podium[1], podium[0], podium[2]];

  return (
    <section>
      <SectionTitle
        eyebrow="MMR"
        title="Rangos dinámicos"
      />

      <p className="text-line/40 text-xs mb-3">
        El MMR se calcula automáticamente con los resultados y la diferencia
        de goles. Las estrellas manuales siguen siendo independientes y las
        usa el Randomizador.
      </p>

      <div className="flex flex-col gap-2 mb-8">
        {mmr.map((player, index) => (
          <div
            key={player.playerId}
            className="flex items-center justify-between px-3.5 py-2.5 border border-line/10 rounded-xl bg-line/3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-5 text-center font-mono text-line/40 text-[13px]">
                {index + 1}
              </span>

              <Avatar
                name={player.playerName}
                photoUrl={player.photoUrl}
                size={34}
              />

              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">
                  {player.playerName}
                </div>

                <div className="text-line/45 text-[11px]">
                  {player.gamesPlayed} partidos · {player.wins}G{" "}
                  {player.losses}P
                  {player.draws > 0 ? ` ${player.draws}E` : ""}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Chip tone="gold">{player.rank}</Chip>

              <span className="font-mono text-xs font-bold text-line/80">
                {Math.round(player.mmr)} MMR
              </span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle
        eyebrow="Resultados"
        title="Ranking general"
      />

      <div className="flex justify-center gap-2.5 mb-6 items-end">
        {podiumOrder.map((player, index) =>
          player ? (
            <div
              key={player.playerId}
              className={`flex flex-col items-center w-24 ${
                index === 1 ? "order-first" : ""
              }`}
            >
              <Avatar
                name={player.playerName}
                photoUrl={player.photoUrl}
                size={index === 1 ? 56 : 44}
                ring={index === 1 ? "#D4A017" : "#5EDB8C"}
              />

              <div className="text-xs font-bold mt-1.5 text-center break-words leading-tight">
                {player.playerName}
              </div>

              <div className="text-[11px] text-line/50 font-mono">
                {Math.round(player.winRate * 100)}%
              </div>
            </div>
          ) : (
            <div key={index} />
          ),
        )}
      </div>

      <div className="flex flex-col gap-2">
        {stats.map((player, index) => (
          <div
            key={player.playerId}
            className="flex items-center justify-between px-3.5 py-2.5 border border-line/10 rounded-xl bg-line/3"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-center font-mono text-line/40 text-[13px]">
                {index + 1}
              </span>

              <Avatar
                name={player.playerName}
                photoUrl={player.photoUrl}
                size={34}
              />

              <span className="font-semibold text-sm">
                {player.playerName}
              </span>

              {player.specialTagCount > 0 && (
                <Chip tone="fun">
                  gay x{player.specialTagCount}
                </Chip>
              )}
            </div>

            <div className="flex items-center gap-2">
              <StreakChip streak={player.currentStreak} />

              <Chip tone="win">
                {player.wins}G
              </Chip>

              <Chip tone="loss">
                {player.losses}P
              </Chip>

              <Chip tone="gold">
                {Math.round(player.winRate * 100)}%
              </Chip>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}