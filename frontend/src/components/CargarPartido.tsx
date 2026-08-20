import { useState } from "react";
import { Check, Search, UserCheck, UserX } from "lucide-react";
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
                type="button"
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
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [teamAName, setTeamAName] = useState("Equipo A");
  const [teamBName, setTeamBName] = useState("Equipo B");
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [tags, setTags] = useState<Record<string, boolean>>({});
  
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], setList: (v: string[]) => void, other: string[], id: string) => {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
      return;
    }
    if (other.includes(id)) return;
    
    setList([...list, id]);
    setAttendance((prev) => ({ ...prev, [id]: true }));
  };

  const toggleTag = (id: string) => setTags((t) => ({ ...t, [id]: !t[id] }));
  
  const toggleAttendance = (id: string) => {
    setAttendance((prev) => ({ ...prev, [id]: prev[id] === false ? true : false }));
  };

  const canSave = Boolean(date && teamA.length > 0 && teamB.length > 0 && scoreA !== "" && scoreB !== "");

  const allSelected = [...teamA, ...teamB];

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        date,
        teamAName: teamAName.trim() || "Equipo A",
        teamBName: teamBName.trim() || "Equipo B",
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
        teamA: teamA.map((id) => ({ 
          playerId: id, 
          hasSpecialTag: Boolean(tags[id])
        })),
        teamB: teamB.map((id) => ({ 
          playerId: id, 
          hasSpecialTag: Boolean(tags[id])
        })),
        // Array de asistencia independiente con el formato requerido
        attendance: allSelected.map((id) => ({
          playerId: id,
          asistio: attendance[id] !== false
        }))
      });
      setTeamA([]); setTeamB([]); setScoreA(""); setScoreB(""); setTags({}); setAttendance({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el partido");
    } finally {
      setSaving(false);
    }
  };

  if (players.length < 2) {
    return (
      <section>
        <SectionTitle eyebrow="Nuevo partido" title="Cargar resultado" />
        <EmptyState text="Necesitás al menos 2 jugadores en el plantel para armar un partido. Andá a la pestaña Plantel y cargalos." />
      </section>
    );
  }

  return (
    <section>
      <SectionTitle eyebrow="Nuevo partido" title="Cargar resultado" />

      <label className="block text-xs font-semibold text-line/60 uppercase tracking-wide mb-1.5">Fecha</label>
      <input
        type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="w-full bg-line/6 border border-line/15 rounded-lg px-3 py-2.5 text-line text-sm outline-none mb-4"
      />

      <div className="grid grid-cols-2 gap-3.5 mb-4">
        <TeamPicker label={teamAName} onLabelChange={setTeamAName} players={players} selected={teamA} onToggle={(id) => toggle(teamA, setTeamA, teamB, id)} accent="#2ECC71" />
        <TeamPicker label={teamBName} onLabelChange={setTeamBName} players={players} selected={teamB} onToggle={(id) => toggle(teamB, setTeamB, teamA, id)} accent="#3498DB" />
      </div>

      <label className="block text-xs font-semibold text-line/60 uppercase tracking-wide mb-1.5">Resultado</label>
      <div className="flex items-center gap-2.5 mb-4">
        <input type="number" min="0" value={scoreA} onChange={(e) => setScoreA(e.target.value)} placeholder="0"
          className="w-[70px] text-center font-mono text-lg bg-line/6 border border-line/15 rounded-lg px-3 py-2.5 text-line outline-none" />
        <span className="text-line/50 font-mono">—</span>
        <input type="number" min="0" value={scoreB} onChange={(e) => setScoreB(e.target.value)} placeholder="0"
          className="w-[70px] text-center font-mono text-lg bg-line/6 border border-line/15 rounded-lg px-3 py-2.5 text-line outline-none" />
      </div>

      {allSelected.length > 0 && (
        <div className="mb-5">
          <label className="block text-xs font-semibold text-line/60 uppercase tracking-wide mb-1.5">
            Control de Asistencia (¿Quiénes fueron a jugar?)
          </label>
          <div className="flex flex-col gap-2 bg-line/3 border border-line/10 rounded-xl p-3">
            {allSelected.map((id) => {
              const p = players.find((x) => x.id === id);
              if (!p) return null;
              const asistio = attendance[id] !== false;

              return (
                <div key={id} className="flex items-center justify-between py-1 px-2 rounded-lg bg-line/5">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.name} photoUrl={p.photoUrl} size={24} />
                    <span className="text-xs font-bold text-line/80">{p.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAttendance(id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      asistio 
                        ? "bg-win/15 text-win-soft border border-win/30" 
                        : "bg-loss/15 text-loss-soft border border-loss/30"
                    }`}
                  >
                    {asistio ? <UserCheck size={14} /> : <UserX size={14} />}
                    {asistio ? "Asistió (+20)" : "Faltó (-50)"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {allSelected.length > 0 && (
        <>
          <label className="block text-xs font-semibold text-line/60 uppercase tracking-wide mb-1.5">Marcar algo especial (opcional)</label>
          <div className="flex flex-wrap gap-2 mb-5">
            {allSelected.map((id) => {
              const p = players.find((x) => x.id === id);
              if (!p) return null;
              const active = Boolean(tags[id]);
              return (
                <button
                  type="button"
                  key={id} onClick={() => toggleTag(id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{
                    borderColor: active ? "#EC407A" : "rgba(245,241,232,0.15)",
                    background: active ? "rgba(236,64,122,0.18)" : "transparent",
                    color: active ? "#F48FB1" : "rgba(245,241,232,0.6)",
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && <p className="text-loss-soft text-xs mb-3">{error}</p>}

      <button
        type="button"
        onClick={submit} disabled={!canSave || saving}
        className="w-full flex items-center justify-center gap-1.5 bg-win text-pitch-ink rounded-lg py-2.5 font-bold text-sm disabled:opacity-40"
      >
        <Check size={16} /> {saving ? "Guardando..." : "Guardar partido"}
      </button>
    </section>
  );
}