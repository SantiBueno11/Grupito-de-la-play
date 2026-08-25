import { useEffect, useRef, useState } from "react";
import { Camera, Check, Pencil, Plus, Trash2, X, Users, UserPlus } from "lucide-react";
import { Avatar } from "./Avatar";
import { SectionTitle, EmptyState } from "./Shared";
import { fileToCompressedDataUrl } from "../lib/image";
import type { Badge, Player } from "../lib/types";
import { api } from "../lib/api";
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

function PlayerBadges({ playerId }: { playerId: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.players.badges(playerId)
      .then((data: Badge[]) => setBadges(data))
      .catch((err: unknown) => console.error("Error cargando medallas", err))
      .finally(() => setLoading(false));
  }, [playerId]);

  if (loading) {
    return <span className="text-[10px] text-line/40">Cargando logros...</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 transition-all ${
            badge.unlocked
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm"
              : "bg-line/3 border-line/10 text-line/25 grayscale opacity-30"
          }`}
          title={`${badge.title}: ${badge.description}`}
        >
          <span>{badge.icon}</span>
          <span className="font-semibold">{badge.title}</span>
        </div>
      ))}
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
      await onUpdatePhoto(player.id, dataUrl);
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
      await onUpdateName(player.id, trimmed);
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
      player.rating === rating ? null : rating,
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
      onClick={() => void onUpdateEsDelGrupo(player.id, !isDelGrupo)}
      className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors"
      style={{
        borderColor: isDelGrupo ? "#D4A017" : "rgba(245,241,232,0.15)",
        background: isDelGrupo ? "rgba(212,160,23,0.15)" : "transparent",
        color: isDelGrupo ? "#D4A017" : "rgba(245,241,232,0.4)",
      }}
      title={isDelGrupo ? "Es del grupo — tocá para marcarlo como invitado" : "Invitado — tocá para sumarlo al grupo"}
    >
      {isDelGrupo ? <Users size={11} /> : <UserPlus size={11} />}
      {isDelGrupo ? "Grupo" : "Invitado"}
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
        title="Tus jugadores"
      />

      <div className="mb-2 flex gap-2">
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
        <p className="mb-3 text-xs text-loss-soft">
          {error}
        </p>
      )}

      <p className="mb-4 text-xs text-line/40">
        Tocá la foto para cambiarla, el nombre para
        editarlo, o las estrellas para poner su nivel.
      </p>

      {players.length === 0 ? (
        <EmptyState text="Todavía no cargaste jugadores. Agregá a los primeros para poder armar equipos." />
      ) : (
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-start justify-between rounded-xl border border-line/10 bg-line/3 px-3.5 py-3"
            >
              <div className="flex items-start gap-3">
                <PlayerPhotoButton
                  player={player}
                  onUpdatePhoto={onUpdatePhoto}
                />

                <div className="flex flex-col gap-1">
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

                  {/* 🏆 ACÁ SE MUESTRAN LAS MEDALLAS DEL JUGADOR */}
                  <PlayerBadges playerId={player.id} />
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  void onDelete(player.id)
                }
                className="p-1 text-line/40 hover:text-loss-soft"
                title="Eliminar"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}