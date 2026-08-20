import { ChevronDown, Flame, Snowflake, Minus, TrendingUp, TrendingDown, Swords, Trophy, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { Avatar } from "./Avatar";
import { RankLogo } from "./RankLogo";
import { SectionTitle, EmptyState } from "./Shared";
import type { MmrEntry, RankingEntry } from "../lib/types";

// --- CONFIGURACIÓN DE RANGOS ---
const RANK_TIERS = [
  { name: "Gran Campeón", pts: "1650+" },
  { name: "Campeón", pts: "1500 - 1649" },
  { name: "Diamante", pts: "1350 - 1499" },
  { name: "Platino", pts: "1200 - 1349" },
  { name: "Oro", pts: "1050 - 1199" },
  { name: "Plata", pts: "900 - 1049" },
  { name: "Bronce", pts: "< 900" },
];

function streakLabel(streak: number) {
  if (streak > 0) return (
    <span className="font-bold">
      <span className="font-black italic">{streak}</span>{" "}
      {streak === 1 ? "victoria" : "victorias"} seguidas
    </span>
  );

  if (streak < 0) {
    const losses = Math.abs(streak);

    return (
      <span className="font-bold">
        <span className="font-black italic">{losses}</span>{" "}
        {losses === 1 ? "derrota" : "derrotas"} seguidas
      </span>
    );
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

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone: "win" | "loss" | "line";
}) {
  const toneClasses = {
    win: "border-win/25 bg-win/8 text-win-soft",
    loss: "border-loss/25 bg-loss/8 text-loss-soft",
    line: "border-line/10 bg-line/4 text-line/70",
  };

  return (
    <div
      className={`min-w-0 rounded-lg border px-2.5 py-1.5 ${toneClasses[tone]}`}
    >
      <div className="mb-0.5 text-[9px] font-bold uppercase tracking-widest opacity-70">
        {label}
      </div>

      <div className="whitespace-normal break-words text-xs font-black italic tracking-tighter leading-tight">
        {value}
      </div>
    </div>
  );
}

export function Ranking({
  stats,
  mmr,
}: {
  stats: RankingEntry[];
  mmr: MmrEntry[];
}) {
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  const statsByPlayerId = new Map(stats.map((s) => [s.playerId, s]));
  const sortedMmr = [...mmr].sort((a, b) => b.mmr - a.mmr);

  const top3 = sortedMmr.slice(0, 3);
  const restOfPlayers = sortedMmr.slice(3);

  return (
    <section className="w-screen relative left-1/2 -translate-x-1/2 px-6">
      <SectionTitle
        eyebrow="Clasificatoria"
        title="Tabla de rangos"
      />

      {/* CONTENEDOR GRID:
          360px para rangos
          espacio flexible para podio + tabla
          320px para sistema MMR
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)_320px] gap-4 items-start mt-3 w-full">

        {/* =========================================================
            COLUMNA IZQUIERDA: LISTA DE RANGOS
        ========================================================== */}
        <aside
          className="order-2 lg:order-1 bg-line/3 border border-line/10 rounded-2xl p-5 shadow-sm w-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-line/60" />

            <h3 className="font-black italic tracking-tight text-lg text-line/90 uppercase">
              Rangos
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {RANK_TIERS.map((tier) => (
              <div
                key={tier.name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-line/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="scale-110 transform">
                    <RankLogo rank={tier.name} />
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-line/80">
                    {tier.name}
                  </span>
                </div>

                <span className="text-base sm:text-lg font-black italic tracking-tighter text-line/50">
  {tier.pts}
</span>
              </div>
            ))}
          </div>
        </aside>

        {/* =========================================================
            COLUMNA CENTRAL: PODIO Y TABLA
        ========================================================== */}
        <main className="order-1 lg:order-2 min-w-0">
          {mmr.length === 0 ? (
            <EmptyState text="Todavía no hay jugadores para armar la clasificatoria." />
          ) : (
            <>
              {/* =====================================================
                  PODIO (TOP 3)
              ====================================================== */}
              {top3.length > 0 && (
                <div className="flex justify-center items-start gap-2 sm:gap-4 mb-6">
                  {top3.map((player, index) => {
                    const position = index + 1;
                    const isFirst = position === 1;

                    const playerStats = statsByPlayerId.get(player.playerId);
                    const currentStreak = playerStats?.currentStreak ?? 0;
                    const isExpanded =
                      expandedPlayerId === player.playerId;

                    let orderClass = "order-2";
                    let marginClass = "mt-0";

                    if (position === 2) {
                      orderClass = "order-3";
                      marginClass = "mt-6 sm:mt-8";
                    }

                    if (position === 3) {
                      orderClass = "order-1";
                      marginClass = "mt-10 sm:mt-12";
                    }

                    const medalColor =
                      position === 1
                        ? "text-yellow-400"
                        : position === 2
                        ? "text-slate-300"
                        : "text-amber-600";

                    const avatarSize = isFirst ? 64 : 52;

                    return (
                      <div
                        key={player.playerId}
                        className={`flex flex-col w-[105px] sm:w-36 ${orderClass} ${marginClass} transition-all`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPlayerId(
                              isExpanded ? null : player.playerId
                            )
                          }
                          aria-expanded={isExpanded}
                          className="flex flex-col items-center w-full bg-line/5 p-2 sm:p-3 rounded-2xl border border-line/10 shadow-lg hover:bg-line/10 transition-colors relative group"
                        >
                          <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <ChevronDown
                              size={14}
                              className={`text-line/45 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>

                          <div
                            className={`text-3xl sm:text-4xl font-black italic tracking-tighter mb-1 drop-shadow-md ${medalColor}`}
                          >
                            #{position}
                          </div>

                          <div className="mb-1">
                            <Avatar
                              name={player.playerName}
                              photoUrl={player.photoUrl}
                              size={avatarSize}
                            />
                          </div>

                          <div className="text-xs sm:text-sm font-bold truncate w-full text-center mb-1.5">
                            {player.playerName}
                          </div>

                          <div className="flex flex-col items-center gap-1 bg-line/5 w-full py-2 rounded-lg">
                            <div className="scale-[1.5] transform transition-transform group-hover:scale-[1.65] my-1">
                              <RankLogo rank={player.rank} />
                            </div>

                            <div className="flex flex-col items-center mt-1">
                              <span className="text-[11px] sm:text-sm font-black italic tracking-tight text-line/90 leading-none">
                                {player.mmr} PTS
                              </span>

                              <span className="text-[8px] font-bold text-line/45 uppercase tracking-widest">
                                {player.rank}
                              </span>
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="flex flex-col gap-1 mt-1.5 animate-in fade-in slide-in-from-top-2">
                            <StatCard
                              label="Ganados"
                              value={`${playerStats?.wins ?? 0} G`}
                              tone="win"
                            />

                            <StatCard
                              label="Perdidos"
                              value={`${playerStats?.losses ?? 0} P`}
                              tone="loss"
                            />

                            <StatCard
                              label="Racha"
                              value={
                                <StreakValue streak={currentStreak} />
                              }
                              tone="line"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* =====================================================
                  RESTO DE LA TABLA
              ====================================================== */}
              {restOfPlayers.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-line/10 bg-line/3 shadow-sm">
                  {restOfPlayers.map((player, index) => {
                    const playerStats = statsByPlayerId.get(player.playerId);
                    const currentStreak =
                      playerStats?.currentStreak ?? 0;

                    const isExpanded =
                      expandedPlayerId === player.playerId;

                    const realPosition = index + 4;

                    return (
                      <div
                        key={player.playerId}
                        className="border-b border-line/10 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPlayerId(
                              isExpanded ? null : player.playerId
                            )
                          }
                          aria-expanded={isExpanded}
                          className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-line/5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="w-8 shrink-0 text-center font-black italic tracking-tighter text-lg sm:text-xl text-line/40">
                              {realPosition}
                            </span>

                            <Avatar
                              name={player.playerName}
                              photoUrl={player.photoUrl}
                              size={36}
                            />

                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">
                                {player.playerName}
                              </div>

                              <div className="text-[11px] text-line/45">
                                <span className="font-black italic tracking-tighter text-xs">
                                  {player.gamesPlayed}
                                </span>{" "}
                                {player.gamesPlayed === 1
                                  ? "partido"
                                  : "partidos"}{" "}
                                jugados
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-4">
                            <div className="scale-[1.3] transform mx-1">
                              <RankLogo rank={player.rank} />
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-black italic tracking-tight text-line/90">
                                {player.mmr} PTS
                              </div>

                              <div className="text-[9px] font-bold text-line/45 uppercase tracking-wider">
                                {player.rank}
                              </div>
                            </div>

                            <ChevronDown
                              size={16}
                              className={`text-line/45 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="grid grid-cols-3 gap-2 border-t border-line/10 px-3.5 py-3">
                            <StatCard
                              label="Ganados"
                              value={`${playerStats?.wins ?? 0} G`}
                              tone="win"
                            />

                            <StatCard
                              label="Perdidos"
                              value={`${playerStats?.losses ?? 0} P`}
                              tone="loss"
                            />

                            <StatCard
                              label="Racha"
                              value={
                                <StreakValue streak={currentStreak} />
                              }
                              tone="line"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>

        {/* =========================================================
            COLUMNA DERECHA: EXPLICACIÓN DEL MMR
        ========================================================== */}
        <aside
          className="order-3 lg:order-3 bg-line/3 border border-line/10 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Swords size={18} className="text-line/60" />

            <h3 className="font-black italic tracking-tight text-lg text-line/90 uppercase">
              Sistema MMR
            </h3>
          </div>

          <div className="flex flex-col gap-4 text-sm text-line/70">
            <p className="leading-relaxed">
              El <strong>MMR (Matchmaking Rating)</strong> es tu nivel de
              habilidad oculto. Los puntos suben o bajan según el resultado
              de cada partido.
            </p>

            <div className="flex flex-col gap-3">

              {/* ASISTENCIA */}
              <div className="flex gap-3 items-start bg-win/5 p-3 rounded-xl border border-win/10">
                <div className="bg-win/20 p-1.5 rounded-lg text-win-soft shrink-0">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-line/90 text-xs mb-0.5">
                    Asistencia
                  </h4>
                  <p className="text-[11px] leading-tight">
                    Solo por presentarte a jugar sumás <span className="font-bold text-win-soft">+20 puntos</span> automáticos.
                  </p>
                </div>
              </div>

              {/* AUSENCIA */}
              <div className="flex gap-3 items-start bg-loss/5 p-3 rounded-xl border border-loss/10">
                <div className="bg-loss/20 p-1.5 rounded-lg text-loss-soft shrink-0">
                  <UserX size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-line/90 text-xs mb-0.5">
                    Ausencia
                  </h4>
                  <p className="text-[11px] leading-tight">
                    Si estabas en la lista y faltás a último momento, se te castiga con <span className="font-bold text-loss-soft">-50 puntos</span>.
                  </p>
                </div>
              </div>

             {/* GANAR */}
<div className="flex gap-3 items-start bg-win/5 p-3 rounded-xl border border-win/10">
  <div className="bg-win/20 p-1.5 rounded-lg text-win-soft shrink-0">
    <TrendingUp size={16} />
  </div>
  <div>
    <h4 className="font-bold text-line/90 text-xs mb-1.5">
      Ganar Partidos
    </h4>
    <ul className="text-[11px] leading-tight space-y-1.5 list-disc pl-3">
      <li>
        <span className="font-semibold text-line">Victoria:</span> + 15 pts base + (2 pts por gol + 3 pts por cada gol de diferencia que tengas con el equipo contrario).
      </li>
    </ul>
  </div>
</div>

             {/* PERDER */}
<div className="flex gap-3 items-start bg-loss/5 p-3 rounded-xl border border-loss/10">
  <div className="bg-loss/20 p-1.5 rounded-lg text-loss-soft shrink-0">
    <TrendingDown size={16} />
  </div>
  <div>
    <h4 className="font-bold text-line/90 text-xs mb-1.5">
      Derrotas y Ausencias
    </h4>
    <ul className="text-[11px] leading-tight space-y-1.5 list-disc pl-3">
      <li>
        <span className="font-semibold text-line">Derrota:</span> Se restan los puntos del partido (15 + 2 pts por cada gol de diferencia).
      </li>
    </ul>
  </div>
</div>

            </div>
          </div>
        </aside>

      </div>
    </section>
  );
}