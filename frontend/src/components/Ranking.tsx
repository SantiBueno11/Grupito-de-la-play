import { ChevronDown, Flame, Snowflake, Minus } from "lucide-react";
import { useState } from "react";
import { Avatar } from "./Avatar";
import { RankLogo } from "./RankLogo";
import { SectionTitle, EmptyState } from "./Shared";
import type { MmrEntry, RankingEntry } from "../lib/types";

function streakLabel(streak: number) {
  if (streak > 0) return `${streak} ${streak === 1 ? "victoria" : "victorias"} seguidas`;
  if (streak < 0) {
    const losses = Math.abs(streak);
    return `${losses} ${losses === 1 ? "derrota" : "derrotas"} seguidas`;
  }
  return "Sin racha activa";
}

function StreakValue({ streak }: { streak: number }) {
  if (streak > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-win-soft">
        <Flame size={14} />
        {streakLabel(streak)}
      </span>
    );
  }
  if (streak < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-loss-soft">
        <Snowflake size={14} />
        {streakLabel(streak)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-line/45">
      <Minus size={14} />
      {streakLabel(streak)}
    </span>
  );
}

function StatCard({ label, value, tone }: { label: string; value: React.ReactNode; tone: "win" | "loss" | "line" }) {
  const toneClasses = {
    win: "border-win/25 bg-win/8 text-win-soft",
    loss: "border-loss/25 bg-loss/8 text-loss-soft",
    line: "border-line/10 bg-line/4 text-line/70",
  };

  return (
    <div className={`min-w-0 rounded-lg border px-2.5 py-2 ${toneClasses[tone]}`}>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</div>
      <div className="truncate text-xs font-bold">{value}</div>
    </div>
  );
}

export function Ranking({ stats, mmr }: { stats: RankingEntry[]; mmr: MmrEntry[] }) {
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  const statsByPlayerId = new Map(stats.map((s) => [s.playerId, s]));
  const sortedMmr = [...mmr].sort((a, b) => b.rating - a.rating);

  if (mmr.length === 0) {
    return (
      <section>
        <SectionTitle eyebrow="Clasificatoria" title="Tabla de rangos" />
        <EmptyState text="Todavía no hay jugadores para armar la clasificatoria." />
      </section>
    );
  }

  return (
    <section>
      <SectionTitle eyebrow="Clasificatoria" title="Tabla de rangos" />
      

      <div className="overflow-hidden rounded-2xl border border-line/10 bg-line/3">
        {sortedMmr.map((player, index) => {
          const playerStats = statsByPlayerId.get(player.playerId);
          const currentStreak = playerStats?.currentStreak ?? 0;
          const isExpanded = expandedPlayerId === player.playerId;

          return (
            <div key={player.playerId} className="border-b border-line/10 last:border-b-0">
              <button
                type="button"
                onClick={() => setExpandedPlayerId(isExpanded ? null : player.playerId)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-line/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-5 shrink-0 text-center font-mono text-[13px] text-line/40">{index + 1}</span>
                  <Avatar name={player.playerName} photoUrl={player.photoUrl} size={36} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{player.playerName}</div>
                    <div className="text-[11px] text-line/45">
                      {player.played} {player.played === 1 ? "partido" : "partidos"} jugados
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <RankLogo rank={player.tier} />
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-line/85">{player.rating} pts</div>
                    <div className="text-[10px] text-line/45">{player.tier}</div>
                  </div>
                  <ChevronDown size={16} className={`text-line/45 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="grid grid-cols-3 gap-2 border-t border-line/10 px-3.5 py-3">
                  <StatCard label="Ganados" value={`${playerStats?.wins ?? 0}G`} tone="win" />
                  <StatCard label="Perdidos" value={`${playerStats?.losses ?? 0}P`} tone="loss" />
                  <StatCard label="Racha" value={<StreakValue streak={currentStreak} />} tone="line" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}