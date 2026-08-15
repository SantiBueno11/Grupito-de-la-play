import { useState } from "react";
import { Check, Search } from "lucide-react";
import { Avatar } from "./Avatar";
import { SectionTitle, EmptyState } from "./Shared";
import type { CreateMatchInput, Player } from "../lib/types";

interface Props {
  players: Player[];
  onSave: (input: CreateMatchInput) => Promise<void>;
}

function TeamPicker({
  label, onLabelChange, players, selected, onToggle, accent,
}: {
  label: string; onLabelChange: (v: string) => void; players: Player[];
  selected: string[]; onToggle: (id: string) => void; accent: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="border border-line/12 rounded-xl p-3 bg-line/3">
      <input
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        className="bg-transparent border-0 border-b-2 font-display font-semibold text-[15px] pb-1.5 w-full mb-2.5 outline-none text-line"
        style={{ borderBottomColor: accent }}
      />
      <div className="relative mb-2">
        <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-line/35" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar jugador..."
          className="w-full bg-line/6 border border-line/10 rounded-lg pl-7 pr-2 py-1.5 text-xs outline-none placeholder:text-line/35"
        />
      </div>
      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-line/35 text-xs text-center py-3">Sin resultados</p>
        ) : (
          filtered.map((p) => {
            const active = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm"
                style={{
                  background: active ? `${accent}22` : "transparent",
                  color: active ? "#F5F1E8" : "rgba(245,241,232,0.55)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Avatar name={p.name} photoUrl={p.photoUrl} size={24} ring={active ? accent : null} />
                {p.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function CargarPartido({ players, onSave }: Props) {