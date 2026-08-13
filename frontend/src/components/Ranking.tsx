import { Flame, Snowflake } from "lucide-react";
import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { SectionTitle, EmptyState } from "./Shared";
import type { RankingEntry } from "../lib/types";

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

export function Ranking({ stats }: { stats: RankingEntry[] }) {
  if (stats.length === 0) {
    return (
      <section>
        <SectionTitle eyebrow="Tabla" title="Ranking de la semana" />
        <EmptyState text="Todavía no hay partidos cargados para armar el ranking." />
      </section>
    );
  }

  const podium = stats.slice(0, 3);
  const podiumOrder = [podium[1], podium[0], podium[2]];

  return (
    <section>
      <SectionTitle eyebrow="Tabla" title="Ranking general" />

      <div className="flex justify-center gap-2.5 mb-6 items-end">
        {podiumOrder.map((p, i) =>
          p ? (
            <div key={p.playerId} className={`text-center ${i === 1 ? "order-first" : ""}`}>
              <Avatar name={p.playerName} photoUrl={p.photoUrl} size={i === 1 ? 56 : 44} ring={i === 1 ? "#D4A017" : "#5EDB8C"} />
              <div className="text-xs font-bold mt-1.5">{p.playerName}</div>
              <div className="text-[11px] text-line/50 font-mono">{Math.round(p.winRate * 100)}%</div>
            </div>
          ) : <div key={i} />
        )}
      </div>

      <div className="flex flex-col gap-2">
        {stats.map((s, i) => (
          <div key={s.playerId} className="flex items-center justify-between px-3.5 py-2.5 border border-line/10 rounded-xl bg-line/3">
            <div className="flex items-center gap-3">
              <span className="w-5 text-center font-mono text-line/40 text-[13px]">{i + 1}</span>
              <Avatar name={s.playerName} photoUrl={s.photoUrl} size={34} />
              <span className="font-semibold text-sm">{s.playerName}</span>
              {s.specialTagCount > 0 && <Chip tone="fun">gay x{s.specialTagCount}</Chip>}
            </div>
            <div className="flex items-center gap-2">
              <StreakChip streak={s.currentStreak} />
              <Chip tone="win">{s.wins}G</Chip>
              <Chip tone="loss">{s.losses}P</Chip>
              <Chip tone="gold">{Math.round(s.winRate * 100)}%</Chip>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
