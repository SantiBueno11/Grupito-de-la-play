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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { SectionTitle, EmptyState } from "./Shared";
import { fileToCompressedDataUrl } from "../lib/image";
import type { Badge, Player } from "../lib/types";
import { api } from "../lib/api";

// Importación de los logos de medallas desde la carpeta assets
import aplastanteImg from "../assets/badges/aplastante.png";
import enLonaImg from "../assets/badges/en_lona.png";
import fantasmaImg from "../assets/badges/fantasma.png";
import invictoDelMesImg from "../assets/badges/invicto_del_mes.png";
import medallaElFielImg from "../assets/badges/medalla_el_fiel.png";
import muroImg from "../assets/badges/muro.png";
import rachaFuegoImg from "../assets/badges/racha_fuego.png";
import veteranoImg from "../assets/badges/veterano.png";

// Diccionario exacto con las 8 medallas oficiales
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
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdatePhoto: (
    id: string,
    photoUrl: string | null,
  ) => Promise<void>;
  onUpdateName: (
    id: string,
    name: string,
  ) => Promise<void>;
  onUpdateRating: (
    id: string,
    rating: number | null,
  ) => Promise<void>;
  onUpdateEsDelGrupo: (
    id: string,
    esDelGrupo: boolean,
  ) => Promise<void>;
}

// Guía de medallas oficial (8 en total)
const BADGE_DEFINITIONS = [
  {
    id: "el_fiel",
    title: "El Fiel",
    description: "Asistir a 5 partidos seguidos sin faltar",
  },
  {
    id: "racha_fuego",
    title: "Racha de Fuego",
    description: "Ganar 3 partidos consecutivos",
  },
  {
    id: "el_fantasma",
    title: "El Fantasma",
    description: "Faltar a 3 convocatorias al hilo",
  },
  {
    id: "muro",
    title: "El Muro",
    description: "Ganar un partido manteniendo la valla invicta",
  },
  {
    id: "en_lona",
    title: "En la Lona",
    description: "Perder 3 partidos seguidos",
  },
  {
    id: "veterano",
    title: "Veterano",
    description: "Alcanzar los 20 partidos jugados",
  },
  {
    id: "aplastante",
    title: "Aplastante",
    description: "Ganar un partido por goleada (4+ goles de diferencia)",
  },
  {
    id: "invicto_mes",
    title: "Invicto del Mes",
    description: "No perder ningún partido durante todo un mes",
  },
];

function PlayerCard({
  player,
  onDelete,
  onUpdatePhoto,
  onUpdateName,
  onUpdateRating,
  onUpdateEsDelGrupo,
}: {
  player: Player;
  onDelete: Props["onDelete"];
  onUpdatePhoto: Props["onUpdatePhoto"];
  onUpdateName: Props["onUpdateName"];
  onUpdateRating: Props["onUpdateRating"];
  onUpdateEsDelGrupo: Props["onUpdateEsDelGrupo"];
}) {
  const [expanded, setExpanded] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  const toggleExpand = async () => {
    const nextState = !expanded;

    setExpanded(nextState);

    if (nextState && badges.length === 0) {
      setLoadingBadges(true);

      try {
        const data = await api.players.badges(player.id);

        setBadges(data);
      } catch (err) {
        console.error("Error cargando medallas", err);
      } finally {
        setLoadingBadges(false);
      }
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-line/10 bg-line/3 overflow-hidden transition-all">

      {/* Cabecera principal del jugador */}
      <div className="flex items-start justify-between px-3.5 py-3.5">

        <div className="flex items-start gap-3.5">

          <PlayerPhotoButton
            player={player}
            onUpdatePhoto={onUpdatePhoto}
          />

          <div className="flex flex-col gap-1.5">

            <PlayerNameField
              player={player}
              onUpdateName={onUpdateName}
            />

            <div className="flex flex-wrap items-center gap-2">

              <NumberRating
                player={player}
                onUpdateRating={onUpdateRating}
              />

              <EsDelGrupoBadge
                player={player}
                onUpdateEsDelGrupo={onUpdateEsDelGrupo}
              />

            </div>

            {/* Botón desplegable */}
            <button
              type="button"
              onClick={toggleExpand}
              className="flex items-center gap-1.5 mt-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors w-fit"
            >
              <Trophy size={14} />

              <span>
                {expanded
                  ? "Ocultar medallas y logros"
                  : "Ver medallas y logros"}
              </span>

              {expanded ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

          </div>
        </div>

        <button
          type="button"
          onClick={() => void onDelete(player.id)}
          className="p-1 text-line/40 hover:text-loss-soft"
          title="Eliminar"
        >
          <Trash2 size={15} />
        </button>

      </div>

      {/* Desplegable con medallas */}
      {expanded && (
        <div className="border-t border-line/10 bg-line/5 p-4 animate-fadeIn">

          <h4 className="text-xs font-bold uppercase tracking-wider text-line/60 mb-3">
            Vitrina de Logros de {player.name}
          </h4>

          {loadingBadges ? (

            <p className="text-xs text-line/40 py-4 text-center">
              Cargando medallas...
            </p>

          ) : badges.length === 0 ? (

            <p className="text-xs text-line/40 py-4 text-center">
              No hay medallas disponibles.
            </p>

          ) : (

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">

              {badges.map((badge) => {

                const imgSrc = badgeImages[badge.id];

                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center justify-between h-[210px] p-3.5 rounded-xl border text-center transition-all ${
                      badge.unlocked
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md"
                        : "bg-line/3 border-line/10 text-line/30 grayscale opacity-40"
                    }`}
                    title={`${badge.title}: ${badge.description}`}
                  >

                    {/* ÁREA DE LA MEDALLA */}
                    <div className="flex items-center justify-center w-full h-[140px] overflow-visible">

                      {imgSrc ? (

                        <img
                          src={imgSrc}
                          alt={badge.title}
                          className="w-full h-full object-contain scale-[3.5] drop-shadow-xl"
                        />
                      ) : (
                        <span className="text-7xl">
                          🏆
                        </span>
                      )}
                    </div>

                    {/* Estado de la medalla */}
                    <div className="flex flex-col items-center w-full mt-2">
                      <span
                        className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          badge.unlocked
                            ? "bg-amber-500 text-pitch-ink"
                            : "bg-line/10 text-line/40"
                        }`}
                      >
                        {badge.unlocked
                          ? "Desbloqueado"
                          : "Bloqueado"}
                      </span>
                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>
      )}

    </div>
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

  const onChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const dataUrl = await fileToCompressedDataUrl(file);

      await onUpdatePhoto(
        player.id,
        dataUrl,
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={pick}
      className="group relative shrink-0"
      title="Cambiar foto"
      disabled={uploading}
    >

      <Avatar
        name={player.name}
        photoUrl={player.photoUrl}
      />

      <span
        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2"
        style={{
          background: "#D4A017",
          borderColor: "#0F2419",
        }}
      >

        <Camera
          size={11}
          color="#0F2419"
        />

      </span>

      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[9px] font-bold">
          ...
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />

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
      await onUpdateName(
        player.id,
        trimmed,
      );

      setEditing(false);
    } catch (errorValue) {
      setError(
        errorValue instanceof Error
          ? errorValue.message
          : "No se pudo cambiar el nombre",
      );
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
            onChange={(event) =>
              setValue(event.target.value)
            }
            onKeyDown={(event) => {

              if (event.key === "Enter") {
                void save();
              }

              if (event.key === "Escape") {
                cancel();
              }

            }}
            className="w-40 rounded-lg border border-gold/50 bg-line/6 px-2 py-1 text-sm font-semibold outline-none"
          />

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="p-1 text-win-soft"
            title="Guardar"
          >
            <Check size={16} />
          </button>

          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="p-1 text-line/40"
            title="Cancelar"
          >
            <X size={16} />
          </button>

        </div>

        {error && (
          <p className="text-xs text-loss-soft">
            {error}
          </p>
        )}

      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group flex items-center gap-1.5"
    >

      <span className="font-semibold">
        {player.name}
      </span>

      <Pencil
        size={13}
        className="text-line/30 group-hover:text-line/60"
      />

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

    onUpdateRating(
      player.id,
      player.rating === rating
        ? null
        : rating,
    );

  };

  return (
    <div className="flex items-center gap-1">

      <span className="mr-0.5 text-[10px] uppercase tracking-wide text-line/40">
        Nivel
      </span>

      {[1, 2, 3, 4, 5].map((rating) => {

        const active = player.rating === rating;

        return (
          <button
            key={rating}
            type="button"
            onClick={() => click(rating)}
            className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-colors"
            style={{
              borderColor: active
                ? "#D4A017"
                : "rgba(245,241,232,0.15)",

              background: active
                ? "#D4A017"
                : "transparent",

              color: active
                ? "#0F2419"
                : "rgba(245,241,232,0.5)",
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
      onClick={() =>
        void onUpdateEsDelGrupo(
          player.id,
          !isDelGrupo,
        )
      }
      className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors"
      style={{
        borderColor: isDelGrupo
          ? "#D4A017"
          : "rgba(245,241,232,0.15)",

        background: isDelGrupo
          ? "rgba(212,160,23,0.15)"
          : "transparent",

        color: isDelGrupo
          ? "#D4A017"
          : "rgba(245,241,232,0.4)",
      }}
      title={
        isDelGrupo
          ? "Es del grupo — tocá para marcarlo como invitado"
          : "Invitado — tocá para sumarlo al grupo"
      }
    >

      {isDelGrupo ? (
        <Users size={11} />
      ) : (
        <UserPlus size={11} />
      )}

      {isDelGrupo
        ? "Grupo"
        : "Invitado"}

    </button>
  );
}

export function Plantel({
  players,
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

    if (!trimmedName) {
      return;
    }

    setSaving(true);
    setError(null);

    try {

      await onCreate(trimmedName);

      setName("");

    } catch (errorValue) {

      setError(
        errorValue instanceof Error
          ? errorValue.message
          : "No se pudo agregar el jugador",
      );

    } finally {

      setSaving(false);

    }
  };

  return (
    <section>

      <SectionTitle
        eyebrow="Plantel"
        title="Tus jugadores y logros"
      />

      {/* DISEÑO EN 2 COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

        {/* COLUMNA IZQUIERDA: Jugadores */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          <div className="flex gap-2">

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              onKeyDown={(event) => {

                if (event.key === "Enter") {
                  void add();
                }

              }}
              placeholder="Nombre del jugador"
              className="flex-1 rounded-lg border border-line/15 bg-line/6 px-3 py-2.5 text-sm text-line outline-none placeholder:text-line/40"
            />

            <button
              type="button"
              onClick={() => void add()}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-win px-4 py-2.5 text-sm font-bold text-pitch-ink disabled:opacity-50"
            >

              <Plus size={16} />

              Agregar

            </button>

          </div>

          {error && (
            <p className="text-xs text-loss-soft">
              {error}
            </p>
          )}

          <p className="text-xs text-line/40">
            Tocá la foto para cambiarla, el nombre para editarlo, o las estrellas para poner su nivel.
          </p>

          {players.length === 0 ? (

            <EmptyState
              text="Todavía no cargaste jugadores. Agregá a los primeros para poder armar equipos."
            />

          ) : (

            <div className="flex flex-col gap-2">

              {players.map((player) => (

                <PlayerCard
                  key={player.id}
                  player={player}
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

        {/* COLUMNA DERECHA: Guía de Medallas */}
        <div className="lg:col-span-1">

          <div className="sticky top-4 rounded-xl border border-line/10 bg-line/3 p-4 flex flex-col gap-3">

            <div className="flex items-center gap-2 border-b border-line/10 pb-2.5">

              <Trophy
                size={18}
                className="text-amber-400"
              />

              <h3 className="font-bold text-sm text-line">
                Guía de Medallas
              </h3>

            </div>

            <p className="text-xs text-line/60 leading-relaxed">
              Cada jugador puede desbloquear estos logros automáticamente según su rendimiento en los partidos:
            </p>

            <div className="flex flex-col gap-2.5 mt-1">

              {BADGE_DEFINITIONS.map((badge) => {

                const imgSrc = badgeImages[badge.id];

                return (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-line/10 bg-line/5"
                  >

                    {imgSrc ? (

                      <img
                        src={imgSrc}
                        alt={badge.title}
                        className="w-7 h-7 object-contain shrink-0"
                      />

                    ) : (

                      <span className="text-xl shrink-0">
                        🏆
                      </span>

                    )}

                    <div className="flex flex-col">

                      <span className="text-xs font-bold text-amber-300">
                        {badge.title}
                      </span>

                      <span className="text-[11px] text-line/60 leading-tight">
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