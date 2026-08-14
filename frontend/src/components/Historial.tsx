import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { SectionTitle, EmptyState, fmtDate } from "./Shared";
import type { Match, MatchPlayer } from "../lib/types";

interface Props {
  matches: Match[];
  onDelete: (id: string) => Promise<void>;
}

function TeamRoster({ list, align = "left" }: { list: MatchPlayer[]; align?: "left" | "right" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : "items-start"}`}>
      {list.map((mp) => (
        <div key={mp.playerId} className={`flex items-center gap-1.5 ${align === "right" ? "flex-row-reverse" : ""}`}>
          <Avatar name={mp.playerName} photoUrl={mp.photoUrl} size={20} />
          <span className={`text-xs ${mp.hasSpecialTag ? "text-fun-soft" : "text-line/60"}`}>{mp.playerName}</span>
        </div>
      ))}
    </div>
  );
}

export function Historial({ matches, onDelete }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line/15" />

        <div className="flex flex-col gap-5">
          {matches.map((m) => {
            let resultA: "win" | "loss" | "draw" = "draw";
            let resultB: "win" | "loss" | "draw" = "draw";
            if (m.scoreA > m.scoreB) { resultA = "win"; resultB = "loss"; }
            else if (m.scoreB > m.scoreA) { resultA = "loss"; resultB = "win"; }

            const nameColor = (r: "win" | "loss" | "draw") =>
              r === "win" ? "text-win-soft" : r === "loss" ? "text-loss-soft" : "text-line/70";
            const scoreColor = (r: "win" | "loss" | "draw") =>
              r === "win" ? "text-win-soft" : r === "loss" ? "text-loss-soft" : "text-line";

            const isOpen = expanded.has(m.id);

            return (
              <div key={m.id} className="relative">
                <div
                  className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2"
                  style={{ background: "#0F2419", borderColor: "#D4A017" }}
                />

                <div className="text-[11px] font-mono text-line/45 mb-1.5">{fmtDate(m.date)}</div>

                <div className="border border-line/10 rounded-xl bg-line/3 overflow-hidden">
                  <button
                    onClick={() => toggle(m.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-sm font-semibold truncate ${nameColor(resultA)}`}>
                        {m.teamAName}
                      </span>
                      <span className="font-mono text-base font-bold whitespace-nowrap">
                        <span className={scoreColor(resultA)}>{m.scoreA}</span>
                        <span className="opacity-30 mx-1">-</span>
                        <span className={scoreColor(resultB)}>{m.scoreB}</span>
                      </span>
                      <span className={`text-sm font-semibold truncate ${nameColor(resultB)}`}>
                        {m.teamBName}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className="text-line/40 flex-shrink-0 ml-2 transition-transform"
                      style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-line/10">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <TeamRoster list={m.teamA} />
                        <TeamRoster list={m.teamB} align="right" />
                      </div>
                      <button
                        onClick={() => onDelete(m.id)}
                        className="flex items-center gap-1.5 text-line/40 hover:text-loss-soft text-xs"
                      >
                        <Trash2 size={13} /> Eliminar partido
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}