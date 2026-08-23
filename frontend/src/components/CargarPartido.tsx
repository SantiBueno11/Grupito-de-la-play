import { useState } from "react";
import { Check, Search, UserX } from "lucide-react";
import { Avatar } from "./Avatar";
import { SectionTitle, EmptyState } from "./Shared";
import type { CreateMatchInput, Player } from "../lib/types";

interface Props {
  players: Player[];
  onSave: (input: CreateMatchInput) => Promise<void>;
}

type Assignment = "A" | "B" | "ausente";

export function CargarPartido({ players, onSave }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [teamAName, setTeamAName] = useState("Equipo A");
  const [teamBName, setTeamBName] = useState("Equipo B");
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [tags, setTags] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  // Una sola fuente de verdad: cada jugador tiene A, B, ausente, o nada (sin asignar todavía)
  const [assignment, setAssignment] = useState<Record<string, Assignment>>({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPlayerAssignment = (id: string, value: Assignment) => {
    setAssignment((prev) => ({
      ...prev,
      // Tocar la misma opción de nuevo la desmarca (vuelve a "sin asignar")
      [id]: prev[id] === value ? undefined : value,
    }) as Record<string, Assignment>);
  };

  const toggleTag = (id: string) => setTags((t) => ({ ...t, [id]: !t[id] }));

  const teamA = players.filter((p) => assignment[p.id] === "A").map((p) => p.id);
  const teamB = players.filter((p) => assignment[p.id] === "B").map((p) => p.id);
  const ausentes = players.filter((p) => assignment[p.id] === "ausente").map((p) => p.id);

  const canSave = Boolean(date && teamA.length > 0 && teamB.length > 0 && scoreA !== "" && scoreB !== "");

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
          hasSpecialTag: Boolean(tags[id]),
        })),
        teamB: teamB.map((id) => ({
          playerId: id,
          hasSpecialTag: Boolean(tags[id]),
        })),
        // Los que jugaron cuentan como asistieron. Los ausentes van acá
        // con asistio: false, SIN estar en ningun equipo.
        attendance: [
          ...teamA.map((id) => ({ playerId: id, asistio: true })),
          ...teamB.map((id) => ({ playerId: id, asistio: true })),
          ...ausentes.map((id) => ({ playerId: id, asistio: false })),
        ],
      });
      setScoreA("");
      setScoreB("");
      setTags({});
      setAssignment({});
      setSearch("");
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

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <section>
      <SectionTitle eyebrow="Nuevo partido" title="Cargar resultado" />

      <label className="block text-xs font-semibold text-line/60 uppercase tracking-wide mb-1.5">Fecha</label>
      <input
        type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="w-full bg-line/6 border border-line/15 rounded-lg px-3 py-2.5 text-line text-sm outline-none mb-4"
      />

      <div className="grid grid-cols-2 gap-3.5 mb-4">
        <input
          value={teamAName}
          onChange={(e) => setTeamAName(e.target.value)}
          className="bg-transparent border-0 border-b-2 font-display font-semibold text-[15px] pb-1.5 w-full outline-none text-line"
          style={{ borderBottomColor: "#2ECC71" }}
        />
        <input
          value={teamBName}
          onChange={(e) => setTeamBName(e.target.value)}
          className="bg-transparent border-0 border-b-2 font-display font-semibold text-[15px] pb-1.5 w-full outline-none text-line"
          style={{ borderBottomColor: "#3498DB" }}
        />
      </div>

      <label className="block text-xs font-semibold text-line/60 uppercase tracking-wide mb-1.5">Resultado</label>
      <div className="flex items-center gap-2.5 mb-4">
        <input type="number" min="0" value={scoreA} onChange={(e) => setScoreA(e.target.value)} placeholder="0"
          className="w-[70px] text-center font-mono text-lg bg-line/6 border border-line/15 rounded-lg px-3 py-2.5 text-line outline-none" />
        <span className="text-line/50 font-mono">—</span>
        <input type="number" min="0" value={scoreB} onChange={(e) => setScoreB(e.target.value)} placeholder="0"
          className="w-[70px] text-center font-mono text-lg bg-line/6 border border-line/15 rounded-lg px-3 py-2.5 text-line outline-none" />
      </div>

      <label className="block text-xs font-semibold text-line/60 uppercase tracking-wide mb-1.5">
        Jugadores — marcá equipo o ausente
      </label>

      <div className="relative mb-2">
        <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-line/35" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar jugador..."
          className="w-full bg-line/6 border border-line/10 rounded-lg pl-7 pr-2 py-1.5 text-xs outline-none placeholder:text-line/35"
        />
      </div>

      <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto mb-5 border border-line/10 rounded-xl p-2 bg-line/3">
        {filtered.length === 0 ? (
          <p className="text-line/35 text-xs text-center py-3">Sin resultados</p>
        ) : (
          filtered.map((p) => {
            const current = assignment[p.id];
            return (
              <div key={p.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-line/5">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    name={p.name}
                    photoUrl={p.photoUrl}
                    size={26}
                    ring={current === "A" ? "#2ECC71" : current === "B" ? "#3498DB" : current === "ausente" ? "#E74C3C" : null}
                  />
                  <span className="text-sm font-semibold truncate">{p.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPlayerAssignment(p.id, "A")}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors"
                    style={{
                      background: current === "A" ? "#2ECC7133" : "transparent",
                      borderColor: current === "A" ? "#2ECC71" : "rgba(245,241,232,0.15)",
                      color: current === "A" ? "#2ECC71" : "rgba(245,241,232,0.5)",
                    }}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerAssignment(p.id, "B")}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors"
                    style={{
                      background: current === "B" ? "#3498DB33" : "transparent",
                      borderColor: current === "B" ? "#3498DB" : "rgba(245,241,232,0.15)",
                      color: current === "B" ? "#3498DB" : "rgba(245,241,232,0.5)",
                    }}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerAssignment(p.id, "ausente")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors"
                    style={{
                      background: current === "ausente" ? "#E74C3C33" : "transparent",
                      borderColor: current === "ausente" ? "#E74C3C" : "rgba(245,241,232,0.15)",
                      color: current === "ausente" ? "#E74C3C" : "rgba(245,241,232,0.5)",
                    }}
                  >
                    <UserX size={12} /> Faltó
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {(teamA.length > 0 || teamB.length > 0) && (
        <>
          <label className="block text-xs font-semibold text-line/60 uppercase tracking-wide mb-1.5">Marcar algo especial (opcional)</label>
          <div className="flex flex-wrap gap-2 mb-5">
            {[...teamA, ...teamB].map((id) => {
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