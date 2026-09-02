import { useRef, useState } from "react";
import {
  Camera,
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
  Users,
  UserPlus,
  Trophy,
  User,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { SectionTitle, EmptyState } from "./Shared";
import { fileToCompressedDataUrl } from "../lib/image";
import type { Player, Match } from "../lib/types";
import { PlayerProfileModal } from "./PlayerProfileModal";

// Importación de los logos de medallas oficiales para la Guía lateral
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
  players: Player[];
  matches: Match[];
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdatePhoto: (id: string, photoUrl: string | null) => Promise<void>;
  onUpdateName: (id: string, name: string) => Promise<void>;
  onUpdateRating: (id: string, rating: number | null) => Promise<void>;
  onUpdateEsDelGrupo: (id: string, esDelGrupo: boolean) => Promise<void>;
}

const BADGE_DEFINITIONS = [
  { id: "el_fiel", title: "El Fiel", description: "Asistir a 5 partidos seguidos sin faltar" },
  { id: "racha_fuego", title: "Racha de Fuego", description: "Ganar 3 partidos consecutivos" },
  { id: "el_fantasma", title: "El Fantasma", description: "Faltar a 3 convocatorias al hilo" },
  { id: "muro", title: "El Muro", description: "Ganar un partido manteniendo la valla invicta" },
  { id: "en_lona", title: "En la Lona", description: "Perder 3 partidos seguidos" },
  { id: "veterano", title: "Veterano", description: "Alcanzar los 20 partidos jugados" },
  { id: "aplastante", title: "Aplastante", description: "Ganar un partido por goleada (4+ goles de diferencia)" },
  { id: "invicto_mes", title: "Invicto del Mes", description: "No perder ningún partido durante todo un mes" },
];

function PlayerCard({
  player,
  matches,
  players,
  onDelete,
  onUpdatePhoto,
  onUpdateName,
  onUpdateRating,
  onUpdateEsDelGrupo,
}: {
  player: Player;
  matches: Match[];
  players: Player[];
  onDelete: Props["onDelete"];
  onUpdatePhoto: Props["onUpdatePhoto"];
  onUpdateName: Props["onUpdateName"];
  onUpdateRating: Props["onUpdateRating"];
  onUpdateEsDelGrupo: Props["onUpdateEsDelGrupo"];
}) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <div className="flex flex-col rounded-xl border border-line/10 bg-line/3 overflow-hidden transition-all">
        <div className="flex items-start justify-between px-3.5 py-3.5">
          <div className="flex items-start gap-3.5">
            <PlayerPhotoButton player={player} onUpdatePhoto={onUpdatePhoto} />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <PlayerNameField player={player} onUpdateName={onUpdateName} />
                
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-amber-500/25 transition-colors cursor-pointer"
                  title="Ver ficha completa, estadísticas y medallas"
                >
                  <User size={12} />
                  <span>Ver Ficha</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <NumberRating player={player} onUpdateRating={onUpdateRating} />
                <EsDelGrupoBadge player={player} onUpdateEsDelGrupo={onUpdateEsDelGrupo} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onDelete(player.id)}
            className="p-1 text-line/40 hover:text-loss-soft cursor-pointer"
            title="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {showProfileModal && (
        <PlayerProfileModal
          playerId={player.id}
          players={players}
          matches={matches || []}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
}

function PlayerPhotoButton({
  player,
  onUpdatePhoto,
}: {
  player: Player;
  onUpdatePhoto: Props["onUpdatePhoto"];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = () => {
    inputRef.current?.click();
  };

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      await onUpdatePhoto(player.id, dataUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={pick}
      className="group relative shrink-0 cursor-pointer"
      title="Cambiar foto"
      disabled={uploading}
    >
      <Avatar name={player.name} photoUrl={player.photoUrl} />
      <span
        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2"
        style={{ background: "#D4A017", borderColor: "#0F2419" }}
      >
        <Camera size={11} color="#0F2419" />
      </span>
      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[9px] font-bold">
          ...
        </span>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </button>
  );
}

function PlayerNameField({
  player,
  onUpdateName,
}: {
  player: Player;
  onUpdateName: Props["onUpdateName"];
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(player.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setValue(player.name);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === player.name) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onUpdateName(player.id, trimmed);
      setEditing(false);
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : "No se pudo cambiar el nombre");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void save();
              if (event.key === "Escape") cancel();
            }}
            className="w-32 rounded-lg border border-gold/50 bg-line/6 px-2 py-1 text-sm font-semibold outline-none"
          />
          <button type="button" onClick={() => void save()} disabled={saving} className="p-1 text-win-soft cursor-pointer" title="Guardar">
            <Check size={16} />
          </button>
          <button type="button" onClick={cancel} disabled={saving} className="p-1 text-line/40 cursor-pointer" title="Cancelar">
            <X size={16} />
          </button>
        </div>
        {error && <p className="text-xs text-loss-soft">{error}</p>}
      </div>
    );
  }

  return (
    <button type="button" onClick={startEdit} className="group flex items-center gap-1.5 cursor-pointer">
      <span className="font-semibold">{player.name}</span>
      <Pencil size={13} className="text-line/30 group-hover:text-line/60" />
    </button>
  );
}

function NumberRating({
  player,
  onUpdateRating,
}: {
  player: Player;
  onUpdateRating: Props["onUpdateRating"];
}) {
  const click = (rating: number) => {
    onUpdateRating(player.id, player.rating === rating ? null : rating);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="mr-0.5 text-[10px] uppercase tracking-wide text-line/40">Nivel</span>
      {[1, 2, 3, 4, 5].map((rating) => {
        const active = player.rating === rating;
        return (
          <button
            key={rating}
            type="button"
            onClick={() => click(rating)}
            className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-colors cursor-pointer"
            style={{
              borderColor: active ? "#D4A017" : "rgba(245,241,232,0.15)",
              background: active ? "#D4A017" : "transparent",
              color: active ? "#0F2419" : "rgba(245,241,232,0.5)",
            }}
          >
            {rating}
          </button>
        );
      })}
    </div>
  );
}

function EsDelGrupoBadge({
  player,
  onUpdateEsDelGrupo,
}: {
  player: Player;
  onUpdateEsDelGrupo: Props["onUpdateEsDelGrupo"];
}) {
  const isDelGrupo = player.esDelGrupo;

  return (
    <button
      type="button"
      onClick={() => void onUpdateEsDelGrupo(player.id, !isDelGrupo)}
      className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer"
      style={{
        borderColor: isDelGrupo ? "#D4A017" : "rgba(245,241,232,0.15)",
        background: isDelGrupo ? "rgba(212,160,23,0.15)" : "transparent",
        color: isDelGrupo ? "#D4A017" : "rgba(245,241,232,0.4)",
      }}
      title={isDelGrupo ? "Es del grupo" : "Invitado"}
    >
      {isDelGrupo ? <Users size={11} /> : <UserPlus size={11} />}
      {isDelGrupo ? "Grupo" : "Invitado"}
    </button>
  );
}

export function Plantel({
  players,
  matches,
  onCreate,
  onDelete,
  onUpdatePhoto,
  onUpdateName,
  onUpdateRating,
  onUpdateEsDelGrupo,
}: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setSaving(true);
    setError(null);
    try {
      await onCreate(trimmedName);
      setName("");
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : "No se pudo agregar el jugador");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <SectionTitle eyebrow="Plantel" title="Tus jugadores y logros" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void add();
              }}
              placeholder="Nombre del jugador"
              className="flex-1 rounded-lg border border-line/15 bg-line/6 px-3 py-2.5 text-sm text-line outline-none placeholder:text-line/40"
            />
            <button
              type="button"
              onClick={() => void add()}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-win px-4 py-2.5 text-sm font-bold text-pitch-ink disabled:opacity-50 cursor-pointer"
            >
              <Plus size={16} />
              Agregar
            </button>
          </div>

          {error && <p className="text-xs text-loss-soft">{error}</p>}

          <p className="text-xs text-line/40">
            Tocá la foto para cambiarla, el nombre para editarlo, o el botón <b>"Ver Ficha"</b> para abrir su perfil completo con medallas e historial.
          </p>

          {players.length === 0 ? (
            <EmptyState text="Todavía no cargaste jugadores. Agregá a los primeros para poder armar equipos." />
          ) : (
            <div className="flex flex-col gap-2">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  matches={matches}
                  players={players}
                  onDelete={onDelete}
                  onUpdatePhoto={onUpdatePhoto}
                  onUpdateName={onUpdateName}
                  onUpdateRating={onUpdateRating}
                  onUpdateEsDelGrupo={onUpdateEsDelGrupo}
                />
              ))}
            </div>
          )}
        </div>

        {/* Guía de Medallas */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1410] to-[#111a15] p-5 flex flex-col gap-4 shadow-[inset_0_1px_4px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.6)]">
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Trophy size={22} color="#f5b942" className="drop-shadow-[0_0_8px_rgba(245,185,66,0.3)]" />
                <h3 className="font-bold text-[15px] text-[#f5f5f0] tracking-wide">Guía de Medallas</h3>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#f5b942]/30 to-transparent" />
              <p className="text-[12px] text-[#9aa19a] leading-relaxed">
                Cada jugador puede desbloquear estos logros automáticamente según su rendimiento en los partidos:
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              {BADGE_DEFINITIONS.map((badge) => {
                const imgSrc = badgeImages[badge.id];
                
                const getBadgeStyle = (id: string) => {
                  switch (id) {
                    case "el_fiel": return { hex: "#4a9eff", bg: "bg-[#4a9eff]/[0.06]", border: "border-l-[#4a9eff]", title: "text-[#80bfff]", iconDesaturate: "" };
                    case "racha_fuego": return { hex: "#ff8a3d", bg: "bg-[#ff8a3d]/[0.06]", border: "border-l-[#ff8a3d]", title: "text-[#ffb380]", iconDesaturate: "" };
                    case "muro": return { hex: "#c4cdd6", bg: "bg-[#c4cdd6]/[0.06]", border: "border-l-[#c4cdd6]", title: "text-[#e2e8f0]", iconDesaturate: "" };
                    case "veterano": return { hex: "#4ade80", bg: "bg-[#4ade80]/[0.06]", border: "border-l-[#4ade80]", title: "text-[#86efac]", iconDesaturate: "" };
                    case "aplastante": return { hex: "#fbbf24", bg: "bg-[#fbbf24]/[0.06]", border: "border-l-[#fbbf24]", title: "text-[#fcd34d]", iconDesaturate: "" };
                    case "invicto_mes": return { hex: "#22d3ee", bg: "bg-[#22d3ee]/[0.06]", border: "border-l-[#22d3ee]", title: "text-[#67e8f9]", iconDesaturate: "" };
                    case "el_fantasma": return { hex: "#b91c3c", bg: "bg-[#b91c3c]/[0.08]", border: "border-l-[#b91c3c]", title: "text-[#d66b7c]", iconDesaturate: "grayscale opacity-75 contrast-75" };
                    case "en_lona": return { hex: "#dc2626", bg: "bg-[#dc2626]/[0.08]", border: "border-l-[#dc2626]", title: "text-[#f87171]", iconDesaturate: "saturate-50 opacity-80" };
                    default: return { hex: "#ffffff", bg: "bg-white/5", border: "border-l-white", title: "text-white", iconDesaturate: "" };
                  }
                };

                const style = getBadgeStyle(badge.id);

                return (
                  <div 
                    key={badge.id} 
                    className={`group relative flex items-center gap-5 p-3.5 pr-4 rounded-xl border border-transparent border-l-[3.5px] ${style.border} ${style.bg} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden`}
                  >
                    {/* Hover brighten overlay */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-200 pointer-events-none" />
                    
                    {/* Icon halo/glow */}
                    <div 
                      className="absolute left-4 w-10 h-10 rounded-full blur-xl transition-opacity duration-200 opacity-50 group-hover:opacity-80" 
                      style={{ backgroundColor: style.hex }} 
                    />

                    {imgSrc ? (
                      <div className="relative shrink-0 flex items-center justify-center">
                        <img 
                          src={imgSrc} 
                          alt={badge.title} 
                          className={`w-[40px] h-[40px] object-contain relative z-10 transition-transform duration-200 group-hover:scale-105 drop-shadow-md ${style.iconDesaturate}`} 
                        />
                      </div>
                    ) : (
                      <div className="w-[40px] h-[40px] relative z-10 shrink-0 flex items-center justify-center bg-black/40 rounded-full border border-white/10 shadow-inner">
                        <span className="text-xl drop-shadow-md">🏆</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col z-10 justify-center">
                      <span className={`text-[13px] font-bold tracking-wide ${style.title}`}>
                        {badge.title}
                      </span>
                      <span className="text-[11px] text-[#8a8f8a] leading-[1.3] mt-0.5 max-w-[95%] line-clamp-2">
                        {badge.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}