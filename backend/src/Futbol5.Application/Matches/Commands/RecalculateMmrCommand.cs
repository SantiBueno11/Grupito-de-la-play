using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Commands;

public record RecalculateMmrCommand() : IRequest<string>;

public class RecalculateMmrCommandHandler(IApplicationDbContext context) : IRequestHandler<RecalculateMmrCommand, string>
{
    public async Task<string> Handle(RecalculateMmrCommand request, CancellationToken cancellationToken)
    {
        // 1. AsNoTracking() para que EF Core no intente rastrear los cambios en memoria
        var players = await context.Players.AsNoTracking().ToListAsync(cancellationToken);
        
        var mmrFinales = new Dictionary<Guid, int>();
        foreach (var p in players)
        {
            mmrFinales[p.Id] = 1000;
        }

        var matches = await context.Matches
            .Include(m => m.MatchPlayers)
            .AsNoTracking()
            .OrderBy(m => m.Date)
            .ToListAsync(cancellationToken);

        // 2. Matemática aislada
        foreach (var match in matches)
        {
            if (match.ScoreA == match.ScoreB) continue;

            int diferenciaGoles = Math.Abs(match.ScoreA - match.ScoreB);
            int puntosEnJuego = 15 + (diferenciaGoles * 2);
            bool ganoEquipoA = match.ScoreA > match.ScoreB;

            foreach (var mp in match.MatchPlayers)
            {
                if (!mmrFinales.ContainsKey(mp.PlayerId)) continue;

                bool esDelEquipoA = mp.Team == Team.A;
                bool ganoJugador = (ganoEquipoA && esDelEquipoA) || (!ganoEquipoA && !esDelEquipoA);

                if (ganoJugador)
                {
                    mmrFinales[mp.PlayerId] += puntosEnJuego;
                }
                else
                {
                    mmrFinales[mp.PlayerId] -= puntosEnJuego;
                    if (mmrFinales[mp.PlayerId] < 0) mmrFinales[mp.PlayerId] = 0;
                }
            }
        }

        // 3. Ejecución directa a la base de datos (Bypass del Change Tracker)
        foreach (var kvp in mmrFinales)
        {
            await context.Players
                .Where(p => p.Id == kvp.Key)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.Mmr, kvp.Value), cancellationToken);
        }

        return $"Éxito: Se recalculó el MMR de {players.Count} jugadores usando {matches.Count} partidos históricos.";
    }
}