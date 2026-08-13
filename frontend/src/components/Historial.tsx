import { Trash2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { SectionTitle, EmptyState, fmtDate } from "./Shared";
import type { Match, MatchPlayer } from "../lib/types";

interface Props {
  matches: Match[];
  onDelete: (id: string) => Promise<void>;
}

function TeamBlock({ title, list, win, align = "left" }: { title: string; list: MatchPlayer[]; win: boolean; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div className={`font-display text-[13px] font-semibold mb-1.5 ${win ? "text-win-soft" : "text-line/70"}`}>{title}</div>
      <div className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : "items-start"}`}>
        {list.map((mp) => (
          <div key={mp.playerId} className={`flex items-center gap-1.5 ${align === "right" ? "flex-row-reverse" : ""}`}>
            <Avatar name={mp.playerName} photoUrl={mp.photoUrl} size={18} />
            <span className={`text-xs ${mp.hasSpecialTag ? "text-fun-soft" : "text-line/60"}`}>
              {mp.playerName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Historial({ matches, onDelete }: Props) {
  if (matches.length === 0) {
    return (
      <section>
        <SectionTitle eyebrow="Registro" title="Historial de partidos" />
        <EmptyState text="Todavía no cargaste ningún partido. Andá a Cargar partido para sumar el primero." />
      </section>
    );
  }

  return (
    <section>
      <SectionTitle eyebrow="Registro" title="Historial de partidos" />
      <div className="flex flex-col gap-3.5">
        {matches.map((m) => {
          const aWins = m.scoreA > m.scoreB;
          const bWins = m.scoreB > m.scoreA;
          return (
            <div key={m.id} className="border border-dashed border-line/20 rounded-2xl p-4 bg-line/3">
              <div className="flex justify-between items-center mb-2.5">
                <Chip>{fmtDate(m.date)}</Chip>
                <button onClick={() => onDelete(m.id)} className="text-line/40 hover:text-loss-soft p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
                <TeamBlock title={m.teamAName} list={m.teamA} win={aWins} />
                <div className="font-mono font-bold text-[22px] text-center">
                  <span className={aWins ? "text-win-soft" : bWins ? "text-loss-soft" : "text-line"}>{m.scoreA}</span>
                  <span className="opacity-40 mx-1.5">-</span>
                  <span className={bWins ? "text-win-soft" : aWins ? "text-loss-soft" : "text-line"}>{m.scoreB}</span>
                </div>
                <TeamBlock title={m.teamBName} list={m.teamB} win={bWins} align="right" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
