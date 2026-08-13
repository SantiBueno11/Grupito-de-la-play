import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { SectionTitle, EmptyState } from "./Shared";
import type { AttendanceEntry } from "../lib/types";

export function Attendance({ data }: { data: AttendanceEntry[] }) {
  if (data.length === 0) {
    return (
      <section>
        <SectionTitle eyebrow="Presentismo" title="Asistencia" />
        <EmptyState text="Todavía no hay jugadores o partidos cargados." />
      </section>
    );
  }

  const totalMatches = data[0]?.totalMatches ?? 0;

  return (
    <section>
      <SectionTitle eyebrow="Presentismo" title="Asistencia" />
      <p className="text-line/40 text-xs mb-4">
        Sobre {totalMatches} {totalMatches === 1 ? "partido cargado" : "partidos cargados"} en total.
      </p>

      <div className="flex flex-col gap-2">
        {data.map((a) => (
          <div key={a.playerId} className="flex items-center justify-between px-3.5 py-2.5 border border-line/10 rounded-xl bg-line/3">
            <div className="flex items-center gap-3">
              <Avatar name={a.playerName} photoUrl={a.photoUrl} size={34} />
              <div>
                <div className="font-semibold text-sm">{a.playerName}</div>
                <div className="text-[11px] text-line/45 font-mono">
                  {a.gamesPlayed}/{a.totalMatches} jugados
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {a.gamesMissed > 0 && <Chip tone="loss">{a.gamesMissed} faltó</Chip>}
              <Chip tone="gold">{Math.round(a.attendanceRate * 100)}%</Chip>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
