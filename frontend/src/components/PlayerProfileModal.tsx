import { useEffect, useState } from "react";
import { X, Trophy, Lock, Calendar, Award, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Avatar } from "./Avatar";
import { RankLogo } from "./RankLogo";
import { api } from "../lib/api";
import type { Player, Match, Badge } from "../lib/types";

// Importación de los logos de medallas para la vitrina
import aplastanteImg from "../assets/badges/aplastante.png";
import enLonaImg from "../assets/badges/en_lona.png";
import fantasmaImg from "../assets/badges/fantasma.png";
import invictoDelMesImg from "../assets/badges/invicto_del_mes.png";
import medallaElFielImg from "../assets/badges/medalla_el_fiel.png";
import muroImg from "../assets/badges/muro.png";
import rachaFuegoImg from "../assets/badges/racha_fuego.png";
import veteranoImg from "../assets/badges/veterano.png";

const badgeImages: Record<string, string> = {
  el_fiel: medallaElFielImg,
  racha_fuego: rachaFuegoImg,
  el_fantasma: fantasmaImg,
  muro: muroImg,
  en_lona: enLonaImg,
  veterano: veteranoImg,
  aplastante: aplastanteImg,
  invicto_mes: invictoDelMesImg,
};

interface Props {
  playerId: string;
  players: Player[];
  matches?: Match[];
  onClose: () => void;
}

export function PlayerProfileModal({ playerId, players, matches = [], onClose }: Props) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  const player = players.find((p) => p.id === playerId);

  // Filtrado y cálculo de victorias/derrotas por partido
  const targetId = String(playerId).trim();
  const targetName = player?.name?.trim().toLowerCase();

  const checkItem = (item: any) => {
    if (!item) return false;
    if (typeof item === "string" || typeof item === "number") {
      const val = String(item).trim().toLowerCase();
      return val === targetId.toLowerCase() || (targetName && val.includes(targetName));
    }
    if (typeof item === "object") {
      const possibleIds = [item.id, item.playerId, item._id, item.userId].map(v => v ? String(v).trim() : "");
      const possibleNames = [item.name, item.playerName, item.username].map(v => v ? String(v).trim().toLowerCase() : "");

      if (possibleIds.includes(targetId)) return true;
      if (targetName && possibleNames.some(n => n.includes(targetName))) return true;
    }
    return false;
  };

  let wins = 0;
  let losses = 0;
  let draws = 0;

  const playerMatches = matches.filter((m) => {
    if (!m) return false;
    const inTeamA = Array.isArray(m.teamA) && m.teamA.some(checkItem);
    const inTeamB = Array.isArray(m.teamB) && m.teamB.some(checkItem);
    const inPlayers = Array.isArray((m as any).players) && (m as any).players.some(checkItem);

    return inTeamA || inTeamB || inPlayers;
  }).map((m) => {
    const inTeamA = Array.isArray(m.teamA) && m.teamA.some(checkItem);
    const inTeamB = Array.isArray(m.teamB) && m.teamB.some(checkItem);

    let outcome: "win" | "loss" | "draw" = "draw";
    if (inTeamA) {
      if (m.scoreA > m.scoreB) outcome = "win";
      else if (m.scoreA < m.scoreB) outcome = "loss";
    } else if (inTeamB) {
      if (m.scoreB > m.scoreA) outcome = "win";
      else if (m.scoreB < m.scoreA) outcome = "loss";
    }

    if (outcome === "win") wins++;
    else if (outcome === "loss") losses++;
    else draws++;

    return { ...m, playerOutcome: outcome };
  });

  const totalFiltered = playerMatches.length;
  const winRate = totalFiltered > 0 ? Math.round((wins / totalFiltered) * 100) : 0;

  useEffect(() => {
    async function fetchBadges() {
      try {
        const data = await api.players.badges(playerId);
        setBadges(data);
      } catch (err) {
        console.error("Error al cargar medallas del jugador", err);
      } finally {
        setLoadingBadges(false);
      }
    }
    fetchBadges();
  }, [playerId]);

  if (!player) return null;

  const mmr = (player as any).mmr || 1000;
  let rankName = "Plata";
  if (mmr >= 1650) rankName = "Gran Campeón";
  else if (mmr >= 1500) rankName = "Campeón";
  else if (mmr >= 1350) rankName = "Diamante";
  else if (mmr >= 1200) rankName = "Platino";
  else if (mmr >= 1050) rankName = "Oro";
  else if (mmr >= 900) rankName = "Plata";
  else rankName = "Bronce";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-amber-500/30 bg-[#0B1A12] p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-line/50 hover:text-line rounded-full bg-line/5 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* CABECERA: FOTO GRANDE Y DATOS */}
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-line/10 pb-5">
          <div className="relative shrink-0">
            <Avatar name={player.name} photoUrl={player.photoUrl} size={88} />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-pitch-ink text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {player.esDelGrupo ? "Grupo" : "Invitado"}
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
            <h2 className="text-xl sm:text-2xl font-black text-line">{player.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="scale-90"><RankLogo rank={rankName} /></div>
              <span className="text-sm font-bold text-amber-300">{mmr} PTS ({rankName})</span>
            </div>
            {player.rating && (
              <span className="text-xs text-line/50 mt-0.5">
                Nivel estimado: ⭐ {player.rating} / 5
              </span>
            )}
          </div>
        </div>

        {/* GRÁFICO / ESTADÍSTICAS DE VICTORIAS Y DERROTAS */}
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} />
              <span>Rendimiento (Partidos Jugados: {totalFiltered})</span>
            </div>
            {totalFiltered > 0 && (
              <span className="text-line/70">Efectividad: <strong className="text-amber-300">{winRate}%</strong></span>
            )}
          </div>

          {/* Barra gráfica de proporción */}
          {totalFiltered > 0 && (
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-line/10 border border-line/15 gap-0.5 p-0.5">
              <div 
                className="bg-emerald-500 transition-all rounded-l-full" 
                style={{ width: `${(wins / totalFiltered) * 100}%` }} 
                title={`Victorias: ${wins}`}
              />
              {draws > 0 && (
                <div 
                  className="bg-amber-500 transition-all" 
                  style={{ width: `${(draws / totalFiltered) * 100}%` }} 
                  title={`Empates: ${draws}`}
                />
              )}
              <div 
                className="bg-rose-500 transition-all rounded-r-full" 
                style={{ width: `${(losses / totalFiltered) * 100}%` }} 
                title={`Derrotas: ${losses}`}
              />
            </div>
          )}

          {/* Conteo detallado */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 flex flex-col">
              <span className="text-line/50 text-[10px] uppercase font-bold">Ganados</span>
              <span className="font-black text-emerald-400 text-sm mt-0.5">{wins}</span>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 flex flex-col">
              <span className="text-line/50 text-[10px] uppercase font-bold">Empates</span>
              <span className="font-black text-amber-400 text-sm mt-0.5">{draws}</span>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 flex flex-col">
              <span className="text-line/50 text-[10px] uppercase font-bold">Perdidos</span>
              <span className="font-black text-rose-400 text-sm mt-0.5">{losses}</span>
            </div>
          </div>
        </div>

        {/* HISTORIAL RECIENTE CON ETIQUETAS DE GANADO/PERDIDO */}
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Calendar size={16} />
            <span>Historial Reciente</span>
          </div>

          {playerMatches.length === 0 ? (
            <p className="text-xs text-line/40 py-3 text-center bg-line/3 rounded-xl border border-line/10">
              Todavía no disputó partidos registrados.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {playerMatches.map((m) => {
                const isWin = m.playerOutcome === "win";
                const isLoss = m.playerOutcome === "loss";

                return (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl border border-line/10 bg-line/5 text-xs">
                    <div className="flex items-center gap-2.5">
                      {isWin ? (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      ) : isLoss ? (
                        <XCircle size={16} className="text-rose-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[9px]">=</div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-line">
                          {new Date(m.date).toLocaleDateString("es-AR", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className={`text-[10px] font-bold uppercase ${isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-amber-400"}`}>
                          {isWin ? "Victoria" : isLoss ? "Derrota" : "Empate"}
                        </span>
                      </div>
                    </div>

                    <div className="font-black text-line/80 bg-black/30 px-2.5 py-1 rounded-lg border border-line/10">
                      A ({m.scoreA}) - ({m.scoreB}) B
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* VITRINA DE LOGROS */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Award size={16} />
            <span>Vitrina de Medallas y Logros</span>
          </div>

          {loadingBadges ? (
            <p className="text-xs text-line/40 py-4 text-center">Cargando medallas...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {badges.map((badge) => {
                const imgSrc = badgeImages[badge.id];
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all ${
                      badge.unlocked
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md"
                        : "bg-line/3 border-line/10 text-line/30 grayscale opacity-40"
                    }`}
                    title={badge.description}
                  >
                    <div className="h-14 flex items-center justify-center relative">
                      {imgSrc ? (
                        <img src={imgSrc} alt={badge.title} className="w-12 h-12 object-contain drop-shadow-md" />
                      ) : (
                        <Trophy size={28} />
                      )}
                      {!badge.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                          <Lock size={16} className="text-line/80" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold mt-2 leading-tight">{badge.title}</span>
                    <span className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full ${badge.unlocked ? "bg-amber-500 text-pitch-ink" : "bg-line/10 text-line/40"}`}>
                      {badge.unlocked ? "Obtenida" : "Bloqueada"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}