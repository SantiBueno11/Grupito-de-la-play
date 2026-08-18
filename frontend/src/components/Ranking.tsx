import { Flame, Snowflake } from "lucide-react";
import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { SectionTitle, EmptyState } from "./Shared";
import type { RankingEntry } from "../lib/types";

// Componente visual del rango con colores épicos para cada categoría
function RankBadge({ rank, mmr }: { rank: string; mmr: number }) {
  const getRankStyle = (r: string) => {
    switch (r?.toLowerCase()) {
      case "bronce": return "bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/30";
      case "plata": return "bg-[#C0C0C0]/10 text-[#C0C0C0] border-[#C0C0C0]/30";
      case "oro": return "bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30";
      case "platino": return "bg-[#00CED1]/10 text-[#00CED1] border-[#00CED1]/30";
      case "diamante": return "bg-[#B9F2FF]/10 text-[#B9F2FF] border-[#B9F2FF]/30";
      case "campeón": return "bg-[#9333EA]/10 text-[#A855F7] border-[#9333EA]/30";
      case "gran campeón": return "bg-[#EF4444]/10 text-[#F87171] border-[#EF4444]/30";
      case "leyenda": return "bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/30";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div 
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getRankStyle(rank)}`}
      title={`${mmr} Puntos`}
    >
      <span>{rank}</span>
      <span className="opacity-60">({mmr})</span>
    </div>
  );
}

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
            <div key={p.playerId} className={`flex flex-col items-center w-24 ${i === 1 ? "order-first" : ""}`}>
              <Avatar name={p.playerName} photoUrl={p.photoUrl} size={i === 1 ? 56 : 44} ring={i === 1 ? "#D4A017" : "#5EDB8C"} />
              <div className="text-xs font-bold mt-1.5 text-center break-words leading-tight">{p.playerName}</div>
              <div className="text-[11px] text-line/50 font-mono mt-0.5">{p.rank} ({p.mmr})</div>
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
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-semibold text-sm leading-tight">{s.playerName}</span>
                {s.rank && s.mmr !== undefined && (
                  <RankBadge rank={s.rank} mmr={s.mmr} />
                )}
              </div>
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