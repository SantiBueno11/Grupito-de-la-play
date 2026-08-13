import { useRef, useState } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { SectionTitle, EmptyState } from "./Shared";
import { fileToCompressedDataUrl } from "../lib/image";
import type { Player } from "../lib/types";

interface Props {
  players: Player[];
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdatePhoto: (id: string, photoUrl: string | null) => Promise<void>;
}

function PlayerPhotoButton({ player, onUpdatePhoto }: { player: Player; onUpdatePhoto: Props["onUpdatePhoto"] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
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
    <button onClick={pick} className="relative group" title="Cambiar foto" disabled={uploading}>
      <Avatar name={player.name} photoUrl={player.photoUrl} />
      <span
        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2"
        style={{ background: "#D4A017", borderColor: "#0F2419" }}
      >
        <Camera size={11} color="#0F2419" />
      </span>
      {uploading && (
        <span className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-[9px] font-bold">
          ...
        </span>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </button>
  );
}

export function Plantel({ players, onCreate, onDelete, onUpdatePhoto }: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    const n = name.trim();
    if (!n) return;
    setSaving(true);
    setError(null);
    try {
      await onCreate(n);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo agregar el jugador");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <SectionTitle eyebrow="Plantel" title="Tus jugadores" />
      <div className="flex gap-2 mb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Nombre del jugador"
          className="flex-1 bg-line/6 border border-line/15 rounded-lg px-3 py-2.5 text-line text-sm outline-none placeholder:text-line/40"
        />
        <button
          onClick={add}
          disabled={saving}
          className="flex items-center gap-1.5 bg-win text-pitch-ink rounded-lg px-4 py-2.5 font-bold text-sm disabled:opacity-50"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>
      {error && <p className="text-loss-soft text-xs mb-3">{error}</p>}
      <p className="text-line/40 text-xs mb-4">Tocá la foto de un jugador para cambiarla.</p>

      {players.length === 0 ? (
        <EmptyState text="Todavía no cargaste jugadores. Agregá a los primeros para poder armar equipos." />
      ) : (
        <div className="flex flex-col gap-2">
          {players.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-3.5 py-2.5 border border-line/10 rounded-xl bg-line/3">
              <div className="flex items-center gap-3">
                <PlayerPhotoButton player={p} onUpdatePhoto={onUpdatePhoto} />
                <span className="font-semibold">{p.name}</span>
              </div>
              <button onClick={() => onDelete(p.id)} className="text-line/40 hover:text-loss-soft p-1" title="Eliminar">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
