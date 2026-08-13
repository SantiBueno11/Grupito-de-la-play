import { useEffect, useState, useCallback } from "react";
import { CalendarDays, ClipboardCheck, Swords, Trophy, Users } from "lucide-react";
import { api } from "./lib/api";
import type { AttendanceEntry, CreateMatchInput, Match, Player, RankingEntry } from "./lib/types";
import { Plantel } from "./components/Plantel";
import { CargarPartido } from "./components/CargarPartido";
import { Historial } from "./components/Historial";
import { Ranking } from "./components/Ranking";
import { Attendance } from "./components/Attendance";
import { HeadToHead } from "./components/HeadToHead";
import grupitoPhoto from "./assets/grupito.png";

type Tab = "cargar" | "historial" | "ranking" | "asistencia" | "caraacara" | "plantel";

const TABS: { id: Tab; label: string; icon: typeof Swords }[] = [
  { id: "cargar", label: "Cargar partido", icon: Swords },
  { id: "historial", label: "Historial", icon: CalendarDays },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "asistencia", label: "Asistencia", icon: ClipboardCheck },
  { id: "caraacara", label: "Cara a cara", icon: Swords },
  { id: "plantel", label: "Plantel", icon: Users },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("cargar");
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const loadAll = useCallback(async () => {
    setLoadError(null);
    try {
      const [p, m, r, a] = await Promise.all([
        api.players.list(),
        api.matches.list(),
        api.matches.ranking(),
        api.matches.attendance(),
      ]);
      setPlayers(p);
      setMatches(m);
      setRanking(r);
      setAttendance(a);
    } catch (e) {
      setLoadError(
        e instanceof Error
          ? `No se pudo conectar con la API (${e.message}). ¿Está corriendo el backend?`
          : "No se pudo conectar con la API."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const createPlayer = async (name: string) => {
    await api.players.create(name);
    await loadAll();
  };

  const deletePlayer = async (id: string) => {
    await api.players.remove(id);
    await loadAll();
    showToast("Jugador eliminado");
  };

  const updatePlayerPhoto = async (id: string, photoUrl: string | null) => {
    await api.players.updatePhoto(id, photoUrl);
    await loadAll();
  };

  const createMatch = async (input: CreateMatchInput) => {
    await api.matches.create(input);
    await loadAll();
    showToast("Partido cargado");
    setTab("historial");
  };

  const deleteMatch = async (id: string) => {
    await api.matches.remove(id);
    await loadAll();
    showToast("Partido eliminado");
  };

  return (
    <div className="min-h-screen text-line font-body pb-10">
      <div className="relative px-5 pt-7 pb-5 border-b border-dashed border-line/20 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full border-2 border-line/8" />
        <div className="flex items-center gap-4">
          <img
            src={grupitoPhoto}
            alt="Grupito de la Play"
            className="w-16 h-16 rounded-full object-cover border-2"
            style={{ borderColor: "#D4A017" }}
          />
          <div>
            <div className="font-mono text-[11px] tracking-[3px] text-win-soft mb-1">FÚTBOL 5 </div>
            <h1 className="font-display font-bold text-3xl m-0">Grupito de la Play</h1>
          </div>
        </div>
        <p className="mt-3 text-line/60 text-sm">Vamos a ver quein la tiene mas larga y a quien se le dejan el toto roto</p>
      </div>

      <div className="flex gap-1.5 px-5 pt-4 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] font-semibold text-[13px] whitespace-nowrap border transition-colors"
              style={{
                borderColor: active ? "#D4A017" : "rgba(245,241,232,0.15)",
                background: active ? "rgba(212,160,23,0.15)" : "transparent",
                color: active ? "#E8C158" : "rgba(245,241,232,0.75)",
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-5 pt-5 max-w-[720px] mx-auto">
        {loading ? (
          <div className="text-center py-16 text-line/50">Cargando...</div>
        ) : loadError ? (
          <div className="border border-loss/40 bg-loss/10 rounded-xl p-5 text-sm text-loss-soft">
            {loadError}
          </div>
        ) : tab === "cargar" ? (
          <CargarPartido players={players} onSave={createMatch} />
        ) : tab === "historial" ? (
          <Historial matches={matches} onDelete={deleteMatch} />
        ) : tab === "ranking" ? (
          <Ranking stats={ranking} />
        ) : tab === "asistencia" ? (
          <Attendance data={attendance} />
        ) : tab === "caraacara" ? (
          <HeadToHead players={players} />
        ) : (
          <Plantel players={players} onCreate={createPlayer} onDelete={deletePlayer} onUpdatePhoto={updatePlayerPhoto} />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-pitch-green border border-win text-line px-4.5 py-2.5 rounded-[10px] text-[13px] font-semibold shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
