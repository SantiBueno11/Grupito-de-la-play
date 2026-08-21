using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Commands;

public record RecalculateMmrCommand() : IRequest<string>;

public class RecalculateMmrCommandHandler(
    IApplicationDbContext context
) : IRequestHandler<RecalculateMmrCommand, string>
{
    private const int MmrInicial = 1000;
    private const int PuntosPorAsistir = 20;
    private const int PenalizacionPorFaltar = 50;
    private const int PuntosBasePorVictoria = 15;
    private const int PuntosPorGolDeDiferencia = 2;

    public async Task<string> Handle(
        RecalculateMmrCommand request,
        CancellationToken cancellationToken)
    {
        Console.WriteLine("\n=================================================");
        Console.WriteLine("🚨 [DEBUG] ¡ESTOY RECALCULANDO LOS PUNTOS! 🚨");
        Console.WriteLine("=================================================\n");

        // ============================================================
        // 1. OBTENER SOLO LOS IDs DE LOS JUGADORES
        // ============================================================
        // Importante: proyectamos SOLO el Id (nunca el objeto Player
        // completo). Player.PhotoUrl guarda la foto en base64 (varios KB
        // por jugador), y traerla acá no sirve para nada: solo infla la
        // memoria del proceso. En Render (plan free, poca RAM) esto era
        // suficiente para tirar abajo el proceso con un crash nativo
        // (status 139 / segfault) al procesar el historial completo.

        var playerIds = await context.Players
            .AsNoTracking()
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        var mmrFinales = new Dictionary<Guid, int>();

        foreach (var id in playerIds)
        {
            mmrFinales[id] = MmrInicial;
        }

        // ============================================================
        // 2. OBTENER TODOS LOS PARTIDOS ORDENADOS POR FECHA
        // ============================================================
        // Mismo criterio: proyectamos solo los campos que el cálculo
        // necesita (fecha, resultado, y de cada MatchPlayer: PlayerId,
        // Team, Asistio). Nada de navegar a Player/PhotoUrl desde acá.

        var matches = await context.Matches
            .OrderBy(m => m.Date)
            .Select(m => new
            {
                m.ScoreA,
                m.ScoreB,
                MatchPlayers = m.MatchPlayers.Select(mp => new
                {
                    mp.PlayerId,
                    mp.Team,
                    mp.Asistio
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        // ============================================================
        // 3. RECALCULAR EL MMR PARTIDO POR PARTIDO
        // ============================================================

        foreach (var match in matches)
        {
            bool esEmpate = match.ScoreA == match.ScoreB;

            int diferenciaGoles = Math.Abs(match.ScoreA - match.ScoreB);

            // Puntos que están en juego según diferencia de goles
            int puntosEnJuego = PuntosBasePorVictoria + (diferenciaGoles * PuntosPorGolDeDiferencia);

            bool ganoEquipoA = match.ScoreA > match.ScoreB;

            foreach (var id in playerIds)
            {
                if (!mmrFinales.ContainsKey(id))
                    continue;

                // Buscar si el jugador tiene participación registrada en este partido
                var mp = match.MatchPlayers
                    .FirstOrDefault(x => x.PlayerId == id);

                // ====================================================
                // CASO 1: EL JUGADOR NO ESTABA CONVOCADO A ESTE PARTIDO
                // ====================================================
                // OJO: esto ya NO penaliza. Antes restaba -50 acá también,
                // lo cual castigaba a jugadores que ni siquiera fueron
                // invitados a esa fecha (ej: alguien que se sumó al grupo
                // después). Si no hay registro de convocatoria, el partido
                // simplemente no afecta el MMR de ese jugador.
                if (mp == null)
                {
                    continue;
                }

                // ====================================================
                // CASO 2: ESTABA CONVOCADO PERO FALTÓ
                // ====================================================

                if (!mp.Asistio)
                {
                    mmrFinales[id] -= PenalizacionPorFaltar;

                    Console.WriteLine($"[DEBUG] ¡FALTA! El jugador {id} tenía la X roja. Puntos: {mmrFinales[id]}");
                }

                // ====================================================
                // CASO 3: EL JUGADOR ASISTIÓ
                // ====================================================

                else
                {
                    if (esEmpate)
                    {
                        mmrFinales[id] += PuntosPorAsistir;
                    }
                    else
                    {
                        bool esDelEquipoA = mp.Team == Team.A;

                        bool ganoJugador =
                            (ganoEquipoA && esDelEquipoA) ||
                            (!ganoEquipoA && !esDelEquipoA);

                        if (ganoJugador)
                        {
                            mmrFinales[id] += PuntosPorAsistir + puntosEnJuego;
                        }
                        else
                        {
                            mmrFinales[id] -= puntosEnJuego;
                        }
                    }
                }

                // ====================================================
                // REGLA DE PIEDAD: nunca menos de 0 puntos
                // ====================================================

                if (mmrFinales[id] < 0)
                {
                    mmrFinales[id] = 0;
                }
            }
        }

        // ============================================================
        // 4. GUARDAR LOS NUEVOS MMR EN LA BASE DE DATOS
        // ============================================================
        // ExecuteUpdateAsync es un bulk update: NO pasa por el Change
        // Tracker de EF. Por eso, después de terminar, limpiamos el
        // tracker: si alguna entidad Player quedó "pegada" en memoria
        // de antes (por ejemplo desde CreateMatchCommandHandler dentro
        // del mismo scope), esto evita que EF la siga devolviendo con
        // el valor viejo en la próxima consulta de este mismo request.

        foreach (var kvp in mmrFinales)
        {
            await context.Players
                .Where(p => p.Id == kvp.Key)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(p => p.Mmr, kvp.Value),
                    cancellationToken
                );
        }

        context.ChangeTracker.Clear();

        Console.WriteLine("🚨 [DEBUG] ¡GUARDADO TERMINADO EN LA BASE DE DATOS! 🚨\n");

        // ============================================================
        // 5. MENSAJE FINAL
        // ============================================================

        return
            $"Éxito: se recalculó el MMR de {playerIds.Count} jugadores " +
            $"usando {matches.Count} partidos históricos.";
    }
}