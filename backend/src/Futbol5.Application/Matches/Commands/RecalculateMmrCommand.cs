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
    public async Task<string> Handle(
        RecalculateMmrCommand request,
        CancellationToken cancellationToken)
    {
        // ============================================================
        // CARTEL DE PRUEBA: Para saber si tu botón realmente llama a esto
        // ============================================================
        Console.WriteLine("\n=================================================");
        Console.WriteLine("🚨 [DEBUG] ¡ESTOY RECALCULANDO LOS PUNTOS! 🚨");
        Console.WriteLine("=================================================\n");

        // ============================================================
        // 1. OBTENER TODOS LOS JUGADORES
        // ============================================================

        var players = await context.Players
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        // Todos empiezan con 1000 puntos
        var mmrFinales = new Dictionary<Guid, int>();

        foreach (var player in players)
        {
            mmrFinales[player.Id] = 1000;
        }

        // ============================================================
        // 2. OBTENER TODOS LOS PARTIDOS ORDENADOS POR FECHA
        // ============================================================

        var matches = await context.Matches
            .Include(m => m.MatchPlayers)
            .AsNoTracking()
            .OrderBy(m => m.Date)
            .ToListAsync(cancellationToken);

        // ============================================================
        // 3. RECALCULAR EL MMR PARTIDO POR PARTIDO
        // ============================================================

        foreach (var match in matches)
        {
            bool esEmpate = match.ScoreA == match.ScoreB;

            int diferenciaGoles = Math.Abs(
                match.ScoreA - match.ScoreB
            );

            // Puntos que están en juego según diferencia de goles
            int puntosEnJuego = 15 + (diferenciaGoles * 2);

            bool ganoEquipoA = match.ScoreA > match.ScoreB;

            foreach (var player in players)
            {
                if (!mmrFinales.ContainsKey(player.Id))
                    continue;

                // Buscar si el jugador tiene participación registrada en este partido
                var mp = match.MatchPlayers
                    .FirstOrDefault(x => x.PlayerId == player.Id);

                // ====================================================
                // CASO 1: EL JUGADOR NO FORMABA PARTE DEL PARTIDO
                // ====================================================

                if (mp == null)
                {
                    // No está entre los 10 que jugaron, por ende NO FUE.
                    // Castigo directo: pierde 50 puntos.
                    mmrFinales[player.Id] -= 50;

                    // AVISO EN CONSOLA PARA VER A QUIÉN LE RESTA
                    Console.WriteLine($"[DEBUG] ¡FALTA! El jugador {player.Id} se quedó afuera. Puntos: {mmrFinales[player.Id]}");
                }

                // ====================================================
                // CASO 2: EL JUGADOR ESTABA EN EL PARTIDO PERO FALTÓ
                // ====================================================

                else if (!mp.Asistio)
                {
                    // FALTÓ AL PARTIDO (Marcado en rojo)
                    mmrFinales[player.Id] -= 50;

                    // AVISO EN CONSOLA PARA VER A QUIÉN LE RESTA
                    Console.WriteLine($"[DEBUG] ¡FALTA! El jugador {player.Id} tenía la X roja. Puntos: {mmrFinales[player.Id]}");
                }

                // ====================================================
                // CASO 3: EL JUGADOR ASISTIÓ
                // ====================================================

                else
                {
                    // ------------------------------------------------
                    // EMPATE
                    // ------------------------------------------------

                    if (esEmpate)
                    {
                        // +20 por asistir
                        mmrFinales[player.Id] += 20;
                    }

                    // ------------------------------------------------
                    // PARTIDO CON GANADOR
                    // ------------------------------------------------

                    else
                    {
                        bool esDelEquipoA = mp.Team == Team.A;

                        bool ganoJugador =
                            (ganoEquipoA && esDelEquipoA) ||
                            (!ganoEquipoA && !esDelEquipoA);

                        // --------------------------------------------
                        // GANÓ
                        // --------------------------------------------

                        if (ganoJugador)
                        {
                            // +20 por asistir + puntos por ganar
                            mmrFinales[player.Id] += 20 + puntosEnJuego;
                        }

                        // --------------------------------------------
                        // PERDIÓ
                        // --------------------------------------------

                        else
                        {
                            // Pierde los puntos del partido
                            mmrFinales[player.Id] -= puntosEnJuego;
                        }
                    }
                }

                // ====================================================
                // REGLA DE PIEDAD
                // Nunca permitir menos de 0 puntos
                // ====================================================

                if (mmrFinales[player.Id] < 0)
                {
                    mmrFinales[player.Id] = 0;
                }
            }
        }

      // 4. GUARDAR LOS NUEVOS MMR EN LA BASE DE DATOS
foreach (var kvp in mmrFinales)
{
    await context.Players
        .Where(p => p.Id == kvp.Key)
        .ExecuteUpdateAsync(
            setters => setters
                .SetProperty(
                    p => p.Mmr, // <-- Tiene que ser Mmr
                    kvp.Value
                ),
            cancellationToken
        );
}

        Console.WriteLine("🚨 [DEBUG] ¡GUARDADO TERMINADO EN LA BASE DE DATOS! 🚨\n");

        // ============================================================
        // 5. MENSAJE FINAL
        // ============================================================

        return
            $"Éxito: se recalculó el MMR de {players.Count} jugadores " +
            $"usando {matches.Count} partidos históricos.";
    }
}