import { useEffect, useState } from "react";
import { X, Trophy, Lock, Calendar, Award, TrendingUp } from "lucide-react";
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

  // Filtrado ultra seguro y flexible de partidos
  const playerMatches = matches.filter((m) => {
    if (!m) return false;
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

    const inTeamA = Array.isArray(m.teamA) && m.teamA.some(checkItem);
    const inTeamB = Array.isArray(m.teamB) && m.teamB.some(checkItem);
    const inPlayers = Array.isArray((m as any).players) && (m as any).players.some(checkItem);

    return inTeamA || inTeamB || inPlayers;
  });

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

        {/* HISTORIAL RECIENTE */}
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <TrendingUp size={16} />
            <span>Partidos Recientes del Jugador ({playerMatches.length})</span>
          </div>

          {playerMatches.length === 0 ? (
            <p className="text-xs text-line/40 py-3 text-center bg-line/3 rounded-xl border border-line/10">
              Todavía no disputó partidos registrados.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {playerMatches.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl border border-line/10 bg-line/5 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-amber-400" />
                    <span>{new Date(m.date).toLocaleDateString("es-AR", { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="font-black text-amber-300">
                    Resultado: A ({m.scoreA}) - ({m.scoreB}) B
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VITRINA DE LOGROS (DESBLOQUEADAS Y CON CANDADO) */}
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