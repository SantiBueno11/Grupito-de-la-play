import { useEffect, useState } from "react";
import { Swords } from "lucide-react";
import { Avatar } from "./Avatar";
import { SectionTitle, EmptyState } from "./Shared";
import { api } from "../lib/api";
import type { HeadToHead as HeadToHeadType, Player } from "../lib/types";

export function HeadToHead({ players }: { players: Player[] }) {
  const [playerAId, setPlayerAId] = useState("");
  const [playerBId, setPlayerBId] = useState("");
  const [data, setData] = useState<HeadToHeadType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerAId || !playerBId || playerAId === playerBId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    api.matches.headToHead(playerAId, playerBId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar la comparación"))
      .finally(() => setLoading(false));
  }, [playerAId, playerBId]);

  if (players.length < 2) {
    return (
      <section>
        <SectionTitle eyebrow="Cara a cara" title="Comparar dos jugadores" />
        <EmptyState text="Necesitás al menos 2 jugadores en el plantel." />
      </section>
    );
  }

  return (
    <section>
      <SectionTitle eyebrow="Cara a cara" title="Comparar dos jugadores" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <select
          value={playerAId}
          onChange={(e) => setPlayerAId(e.target.value)}
          style={{ colorScheme: "dark", borderColor: "#D4A017", color: "#5EDB8C" }}
          className="bg-line/6 border rounded-lg px-3 py-2.5 text-sm outline-none font-semibold"
        >
          <option value="" style={{ backgroundColor: "#D4A017", color: "#0F2419" }}>Jugador 1</option>
          {players.map((p) => (
            <option key={p.id} value={p.id} style={{ backgroundColor: "#D4A017", color: "#0F2419" }}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={playerBId}
          onChange={(e) => setPlayerBId(e.target.value)}
          style={{ colorScheme: "dark", borderColor: "#D4A017", color: "#5EDB8C" }}
          className="bg-line/6 border rounded-lg px-3 py-2.5 text-sm outline-none font-semibold"
        >
          <option value="" style={{ backgroundColor: "#D4A017", color: "#0F2419" }}>Jugador 2</option>
          {players.map((p) => (
            <option key={p.id} value={p.id} style={{ backgroundColor: "#D4A017", color: "#0F2419" }}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {playerAId && playerBId && playerAId === playerBId && (
        <p className="text-loss-soft text-xs">Elegí dos jugadores distintos.</p>
      )}

      {loading && <div className="text-center py-8 text-line/50 text-sm">Cargando...</div>}
      {error && <p className="text-loss-soft text-xs">{error}</p>}

      {data && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
            <div className="flex flex-col items-center">
              <Avatar name={data.playerAName} photoUrl={data.playerAPhotoUrl} size={56} />
              <div className="text-sm font-bold mt-2 text-center break-words leading-tight">{data.playerAName}</div>
            </div>
            <Swords size={20} className="text-line/40 mt-4" />
            <div className="flex flex-col items-center">
              <Avatar name={data.playerBName} photoUrl={data.playerBPhotoUrl} size={56} />
              <div className="text-sm font-bold mt-2 text-center break-words leading-tight">{data.playerBName}</div>
            </div>
          </div>

          <div className="border border-line/12 rounded-xl p-4 bg-line/3">
            <div className="font-display text-sm font-semibold text-win-soft mb-3">Como rivales</div>
            {data.matchesAsRivals === 0 ? (
              <p className="text-line/50 text-xs">Todavía no jugaron en equipos contrarios.</p>
            ) : (
              <>
                <div className="flex items-center justify-center gap-4 font-mono text-2xl font-bold mb-1">
                  <span className="text-win-soft">{data.winsA}</span>
                  <span className="text-line/30 text-sm">—</span>
                  <span className="text-win-soft">{data.winsB}</span>
                </div>
                <p className="text-center text-line/45 text-xs">
                  {data.matchesAsRivals} {data.matchesAsRivals === 1 ? "partido" : "partidos"} enfrentados
                  {data.ties > 0 && ` · ${data.ties} empate${data.ties === 1 ? "" : "s"}`}
                </p>
              </>
            )}
          </div>

          <div className="border border-line/12 rounded-xl p-4 bg-line/3">
            <div className="font-display text-sm font-semibold text-gold-soft mb-3">Como compañeros</div>
            {data.matchesAsTeammates === 0 ? (
              <p className="text-line/50 text-xs">Todavía no jugaron juntos en el mismo equipo.</p>
            ) : (
              <p className="text-line/70 text-sm">
                Jugaron juntos {data.matchesAsTeammates} {data.matchesAsTeammates === 1 ? "vez" : "veces"}:{" "}
                <span className="text-win-soft font-semibold">{data.winsTogether} ganados</span>
                {" · "}
                <span className="text-loss-soft font-semibold">{data.lossesTogether} perdidos</span>
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}