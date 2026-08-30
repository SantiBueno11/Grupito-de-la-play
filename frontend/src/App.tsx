import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  Shuffle,
  Swords,
  Trophy,
  Users,
  Home,
  Menu,
  X,
  PlusCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { api } from "./lib/api";
import type {
  AttendanceEntry,
  CreateMatchInput,
  Match,
  MmrEntry,
  Player,
  RankingEntry,
} from "./lib/types";
import { Plantel } from "./components/Plantel";
import { CargarPartido } from "./components/CargarPartido";
import { Historial } from "./components/Historial";
import { Ranking } from "./components/Ranking";
import { Attendance } from "./components/Attendance";
import { HeadToHead } from "./components/HeadToHead";
import { Randomizador } from "./components/Randomizador";
import { Inicio } from "./components/Inicio";
import grupitoPhoto from "./assets/grupito.png";

type Tab =
  | "inicio"
  | "cargar"
  | "historial"
  | "ranking"
  | "asistencia"
  | "caraacara"
  | "randomizador"
  | "plantel";

const TABS: { id: Tab; label: string; icon: typeof Swords }[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "cargar", label: "Cargar partido", icon: PlusCircle },
  { id: "historial", label: "Historial", icon: CalendarDays },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "asistencia", label: "Asistencia", icon: ClipboardCheck },
  { id: "caraacara", label: "Cara a cara", icon: Swords },
  { id: "randomizador", label: "Randomizador", icon: Shuffle },
  { id: "plantel", label: "Plantel", icon: Users },
];

export default function App() {
  // Estados de Autenticación y Flujo
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem("futbol5_auth") === "true"
  );
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);

  // Estados de Login / Registro local
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("inicio");
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [mmr, setMmr] = useState<MmrEntry[]>([]);
  
  // Estados de Configuración del Grupo
  const [groupSettings, setGroupSettings] = useState({
    name: "Grupito de la Play",
    description: "Registro de partidos, plantel y tabla de la semana",
    photoUrl: "",
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempDesc, setTempDesc] = useState("");
  const [tempPhoto, setTempPhoto] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const loadAll = useCallback(async () => {
    setLoadError(null);
    try {
      const [p, m, r, a, mm, sett] = await Promise.all([
        api.players.list(),
        api.matches.list(),
        api.matches.ranking(),
        api.matches.attendance(),
        api.matches.mmr(),
        api.settings.get(),
      ]);
      setPlayers(p);
      setMatches(m);
      setRanking(r);
      setAttendance(a);
      setMmr(mm);
      setGroupSettings(sett);
      setTempName(sett.name);
      setTempDesc(sett.description);
      setTempPhoto(sett.photoUrl || "");

      // Si viene de registrarse, activamos la pantalla de configuración inicial del grupo
      if (isRegistering) {
        setNeedsSetup(true);
      }
    } catch (e) {
      setLoadError(
        e instanceof Error
          ? `No se pudo conectar con la API (${e.message}). ¿Está corriendo el backend?`
          : "No se pudo conectar con la API.",
      );
    } finally {
      setLoading(false);
    }
  }, [isRegistering]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAll();
    }
  }, [isAuthenticated, loadAll]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (loginUser.trim() === "" || loginPass.trim() === "") {
      setLoginError("Por favor, completa todos los campos.");
      return;
    }

    localStorage.setItem("futbol5_auth", "true");
    setIsAuthenticated(true);
    setLoading(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("futbol5_auth");
    setIsAuthenticated(false);
    setNeedsSetup(false);
    setIsRegistering(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.settings.update({
        name: tempName,
        description: tempDesc,
        photoUrl: tempPhoto,
      });
      setGroupSettings(updated);
      setSettingsOpen(false);
      setNeedsSetup(false);
      setIsRegistering(false);
      showToast("Configuración guardada con éxito");
    } catch (err) {
      showToast("No se pudo guardar la configuración");
    }
  };

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

  const updatePlayerName = async (id: string, name: string) => {
    await api.players.updateName(id, name);
    await loadAll();
  };

  const updatePlayerRating = async (id: string, rating: number | null) => {
    await api.players.updateRating(id, rating);
    await loadAll();
  };

  const updatePlayerEsDelGrupo = async (id: string, esDelGrupo: boolean) => {
    await api.players.updateEsDelGrupo(id, esDelGrupo);
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

  // 1. PANTALLA DE LOGIN / REGISTRO
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1A12] text-line flex items-center justify-center p-4 font-body">
        <div className="bg-[#0F2419] border border-amber-500/30 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <img
              src={grupitoPhoto}
              alt="Grupito de la Play"
              className="w-20 h-20 rounded-full object-cover border-2 mx-auto mb-3 shadow-md"
              style={{ borderColor: "#D4A017" }}
            />
            <h1 className="font-display font-bold text-2xl text-amber-400">Grupito de la Play</h1>
            <p className="text-xs text-line/60 mt-1">
              {isRegistering ? "Creá tu cuenta nueva" : "Iniciá sesión para gestionar tu fútbol"}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs mb-1 text-line/70 font-semibold">Usuario</label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Ingresá tu usuario"
                className="w-full p-3 bg-line/5 rounded-xl border border-line/15 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-line/70 font-semibold">Contraseña</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-line/5 rounded-xl border border-line/15 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-sm transition-colors cursor-pointer mt-2"
            >
              {isRegistering ? "Registrarse y Configurar Grupo 🚀" : "Ingresar 🚀"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setLoginError(null);
              }}
              className="text-xs text-amber-400 hover:underline cursor-pointer font-medium"
            >
              {isRegistering
                ? "¿Ya tenés cuenta? Iniciá sesión"
                : "¿No tenés cuenta? Registrate acá"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-line font-body pb-24 md:pb-10">
      {/* Cabecera */}
      <div className="relative px-4 sm:px-6 pt-6 pb-5 border-b border-dashed border-line/20 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full border-2 border-line/8" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={groupSettings.photoUrl || grupitoPhoto}
              alt="Grupito de la Play"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 shrink-0"
              style={{ borderColor: "#D4A017" }}
            />
            <div>
              <div className="font-mono text-[10px] sm:text-[11px] tracking-[2px] sm:tracking-[3px] text-win-soft mb-0.5">
                FÚTBOL 5 · SEMANAL
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl m-0">
                {groupSettings.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempName(groupSettings.name);
                setTempDesc(groupSettings.description);
                setTempPhoto(groupSettings.photoUrl);
                setSettingsOpen(true);
              }}
              className="p-2.5 rounded-xl bg-line/5 hover:bg-line/10 text-amber-400 border border-amber-500/20 transition-colors cursor-pointer flex items-center justify-center"
              title="Editar configuración del grupo"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer flex items-center justify-center"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <p className="mt-2.5 text-line/60 text-xs sm:text-sm">
          {groupSettings.description}
        </p>
      </div>

      {/* 2. MODAL DE CONFIGURACIÓN POST-REGISTRO O EDICIÓN */}
      {(settingsOpen || needsSetup) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveSettings}
            className="bg-[#0F2419] border border-amber-500/30 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-fadeIn"
          >
            <h2 className="text-base font-bold mb-2 text-amber-400">
              {needsSetup ? "¡Configura tu Grupo Nuevo! ⚽" : "Configurar Grupo"}
            </h2>
            {needsSetup && (
              <p className="text-xs text-line/70 mb-4">
                Personaliza el nombre, la descripción y la foto de tu grupo para comenzar a organizar los partidos.
              </p>
            )}

            <label className="block text-xs mb-1 text-line/70">Nombre del Grupo</label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full p-2.5 mb-3 bg-line/5 rounded-xl border border-line/15 text-white text-sm focus:outline-none focus:border-amber-500"
              required
            />

            <label className="block text-xs mb-1 text-line/70">Descripción / Subtítulo</label>
            <input
              type="text"
              value={tempDesc}
              onChange={(e) => setTempDesc(e.target.value)}
              className="w-full p-2.5 mb-3 bg-line/5 rounded-xl border border-line/15 text-white text-sm focus:outline-none focus:border-amber-500"
            />

            <label className="block text-xs mb-1 text-line/70">URL de la Foto de Perfil</label>
            <input
              type="text"
              value={tempPhoto}
              onChange={(e) => setTempPhoto(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
              className="w-full p-2.5 mb-5 bg-line/5 rounded-xl border border-line/15 text-white text-sm focus:outline-none focus:border-amber-500"
            />

            <div className="flex justify-end gap-2.5">
              {!needsSetup && (
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="px-4 py-2 bg-line/10 hover:bg-line/20 rounded-xl text-xs font-semibold cursor-pointer text-line"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {needsSetup ? "Guardar y Empezar 🚀" : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navegación superior (Desktop) */}
      <div className="hidden md:flex gap-1.5 px-5 pt-4 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] font-semibold text-[13px] whitespace-nowrap border transition-colors cursor-pointer"
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

      {/* Contenido Principal */}
      <div className="px-3 sm:px-5 pt-4 sm:pt-5 max-w-[720px] mx-auto w-full">
        {loading ? (
          <div className="text-center py-16 text-line/50 text-sm">
            Cargando...
          </div>
        ) : loadError ? (
          <div className="border border-loss/40 bg-loss/10 rounded-xl p-4 text-xs sm:text-sm text-loss-soft">
            {loadError}
          </div>
        ) : tab === "inicio" ? (
          <Inicio players={players} matches={matches} mmr={mmr} onNavigate={setTab} />
        ) : tab === "cargar" ? (
          <CargarPartido players={players} onSave={createMatch} />
        ) : tab === "historial" ? (
          <Historial matches={matches} onDelete={deleteMatch} />
        ) : tab === "ranking" ? (
          <Ranking stats={ranking} mmr={mmr} matches={matches} />
        ) : tab === "asistencia" ? (
          <Attendance data={attendance} />
        ) : tab === "caraacara" ? (
          <HeadToHead players={players} />
        ) : tab === "randomizador" ? (
          <Randomizador players={players} />
        ) : (
          <Plantel
            players={players}
            matches={matches}
            onCreate={createPlayer}
            onDelete={deletePlayer}
            onUpdatePhoto={updatePlayerPhoto}
            onUpdateName={updatePlayerName}
            onUpdateRating={updatePlayerRating}
            onUpdateEsDelGrupo={updatePlayerEsDelGrupo}
          />
        )}
      </div>

      {/* Barra inferior fija para celular */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B1A12] border-t border-line/15 py-2 px-3 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {[
          { id: "inicio", label: "Inicio", icon: Home },
          { id: "cargar", label: "Cargar", icon: PlusCircle },
          { id: "ranking", label: "Ranking", icon: Trophy },
          { id: "plantel", label: "Plantel", icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id as Tab);
                setMenuOpen(false);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                active ? "text-amber-400 font-bold" : "text-line/50 font-medium"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            menuOpen ||
            ["historial", "asistencia", "caraacara", "randomizador"].includes(tab)
              ? "text-amber-400 font-bold"
              : "text-line/50 font-medium"
          }`}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="text-[10px] tracking-wide">Más</span>
        </button>
      </div>

      {/* Menú flotante "Más" */}
      {menuOpen && (
        <div className="md:hidden fixed bottom-16 left-3 right-3 bg-[#0F2419] border border-amber-500/30 rounded-2xl p-3 shadow-2xl z-50 animate-fadeIn flex flex-col gap-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-3 py-1 border-b border-line/10 mb-1">
            Otras Secciones
          </div>
          {[
            { id: "historial", label: "Historial de Partidos", icon: CalendarDays },
            { id: "asistencia", label: "Control de Asistencia", icon: ClipboardCheck },
            { id: "caraacara", label: "Cara a Cara", icon: Swords },
            { id: "randomizador", label: "Randomizador de Equipos", icon: Shuffle },
          ].map((subItem) => {
            const Icon = subItem.icon;
            const active = tab === subItem.id;
            return (
              <button
                key={subItem.id}
                onClick={() => {
                  setTab(subItem.id as Tab);
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-line/5 text-line/80 hover:bg-line/10"
                }`}
              >
                <Icon size={18} className="text-amber-400" />
                <span>{subItem.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 md:bottom-5 left-1/2 -translate-x-1/2 bg-pitch-green border border-win text-line px-4.5 py-2.5 rounded-[10px] text-xs sm:text-[13px] font-semibold shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}