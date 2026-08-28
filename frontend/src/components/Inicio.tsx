import { Trophy, Flame, Sparkles, ArrowRight, Calendar } from "lucide-react";
import { Avatar } from "./Avatar";
import type { Player, Match, MmrEntry } from "../lib/types";

interface InicioProps {
  players: Player[];
  matches: Match[];
  mmr: MmrEntry[];
  onNavigate: (tab: any) => void;
}

export function Inicio({ players, matches, mmr, onNavigate }: InicioProps) {
  // Ordenar el MMR real de la API para el podio Top 3 histórico
  const sortedMmr = [...mmr].sort((a, b) => b.mmr - a.mmr);
  const top1 = sortedMmr[0];
  const top2 = sortedMmr[1];
  const top3 = sortedMmr[2];

  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-fadeIn pb-12">
      {/* Banner de Bienvenida */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 p-4 sm:p-6 shadow-xl">
        <div className="absolute -right-6 -bottom-6 opacity-10">
          <Trophy size={140} className="text-amber-400" />
        </div>
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">
            Fútbol 5 • Resumen Semanal
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-line">
            ¡Bienvenido al panel del grupo! ⚽🔥
          </h2>
          <p className="text-xs sm:text-sm text-line/60 max-w-xl">
            Todo lo que está pasando en la fecha: mirá quién lidera el podio, los últimos resultados y el estado de los logros.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-2">
            <button
              type="button"
              onClick={() => onNavigate("cargar")}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-pitch-ink transition-all hover:bg-amber-400 shadow-lg cursor-pointer"
            >
              <span>Cargar nuevo partido</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("plantel")}
              className="flex items-center justify-center gap-2 rounded-xl border border-line/15 bg-line/5 px-4 py-2.5 text-xs font-bold text-line transition-all hover:bg-line/10 cursor-pointer"
            >
              <span>Ver Plantel y Vitrina de Logros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Columna Izquierda */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          
          {/* Podio Histórico (Top 3 MMR) */}
          <div className="rounded-2xl border border-line/10 bg-line/3 p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-line/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-400 shrink-0" />
                <h3 className="font-bold text-sm sm:text-base text-line">Podio Histórico (Top 3 MMR)</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("ranking")}
                className="text-[11px] sm:text-xs font-bold text-amber-400 hover:underline cursor-pointer shrink-0"
              >
                Ver ranking →
              </button>
            </div>

            {sortedMmr.length === 0 ? (
              <p className="text-xs text-line/40 py-6 text-center">No hay datos de MMR registrados todavía.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-4 pb-2">
                
                {/* 2do Puesto (Izquierda - Plata) */}
                {top2 ? (
                  <div className="flex flex-col items-center p-3 rounded-xl border border-slate-400/30 bg-slate-400/10 text-center relative pb-4">
                    <span className="absolute -top-3 text-lg">🥈</span>
                    <div className="my-1">
                      <Avatar name={top2.playerName} photoUrl={top2.photoUrl} />
                    </div>
                    <span className="font-bold text-xs text-line mt-1 truncate max-w-full">
                      {top2.playerName}
                    </span>
                    <span className="text-[11px] font-black text-amber-300 mt-0.5">
                      {top2.mmr} PTS
                    </span>
                  </div>
                ) : <div />}

                {/* 1er Puesto (Centro - Oro, más alto y destacado) */}
                {top1 ? (
                  <div className="flex flex-col items-center p-4 rounded-xl border border-amber-500/50 bg-amber-500/15 text-center relative -mt-4 shadow-[0_0_20px_rgba(245,158,11,0.2)] pb-6">
                    <span className="absolute -top-3.5 text-2xl">🥇</span>
                    <div className="my-1.5">
                      <Avatar name={top1.playerName} photoUrl={top1.photoUrl} />
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm text-line mt-1 truncate max-w-full">
                      {top1.playerName}
                    </span>
                    <span className="text-xs font-black text-amber-300 mt-0.5">
                      {top1.mmr} PTS
                    </span>
                  </div>
                ) : <div />}

                {/* 3er Puesto (Derecha - Bronce) */}
                {top3 ? (
                  <div className="flex flex-col items-center p-3 rounded-xl border border-amber-700/30 bg-amber-900/10 text-center relative pb-2">
                    <span className="absolute -top-3 text-lg">🥉</span>
                    <div className="my-1">
                      <Avatar name={top3.playerName} photoUrl={top3.photoUrl} />
                    </div>
                    <span className="font-bold text-xs text-line mt-1 truncate max-w-full">
                      {top3.playerName}
                    </span>
                    <span className="text-[11px] font-black text-amber-300 mt-0.5">
                      {top3.mmr} PTS
                    </span>
                  </div>
                ) : <div />}

              </div>
            )}
          </div>

          {/* Partidos Recientes */}
          <div className="rounded-2xl border border-line/10 bg-line/3 p-4 sm:p-5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-line/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-amber-400 shrink-0" />
                <h3 className="font-bold text-sm sm:text-base text-line">Últimos Partidos Registrados</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("historial")}
                className="text-[11px] sm:text-xs font-bold text-amber-400 hover:underline cursor-pointer shrink-0"
              >
                Ver historial →
              </button>
            </div>

            {recentMatches.length === 0 ? (
              <p className="text-xs text-line/40 py-6 text-center">Todavía no se jugaron partidos.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-line/10 bg-line/5"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-line">
                        {new Date(match.date).toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-[10px] text-line/50">Fútbol 5</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-1 rounded-lg bg-black/30 border border-line/10 font-black text-xs sm:text-sm">
                      <span className="text-amber-300">A ({match.scoreA})</span>
                      <span className="text-line/40">-</span>
                      <span className="text-line/60">({match.scoreB}) B</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Columna Derecha */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <div className="rounded-2xl border border-line/10 bg-line/3 p-4 sm:p-5 flex flex-col gap-3.5">
            <div className="flex items-center gap-2 border-b border-line/10 pb-2.5">
              <Sparkles size={18} className="text-amber-400 shrink-0" />
              <h3 className="font-bold text-sm sm:text-base text-line">Estado del Grupo</h3>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-line/10 bg-line/5">
                <span className="text-xs text-line/60">Total Jugadores</span>
                <span className="text-xs sm:text-sm font-black text-amber-300">{players.length}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-line/10 bg-line/5">
                <span className="text-xs text-line/60">Partidos Jugados</span>
                <span className="text-xs sm:text-sm font-black text-amber-300">{matches.length}</span>
              </div>
            </div>

            <div className="mt-1 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Flame size={15} />
                <span>¡Vitrina de Logros Activa!</span>
              </div>
              <p className="text-[11px] text-line/60 leading-relaxed">
                Entrá a la sección de <b>Plantel</b> para desplegar las vitrinas de medallas de cada jugador.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}