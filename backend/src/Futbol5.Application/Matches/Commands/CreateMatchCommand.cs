using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Entities;
using Futbol5.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Commands;

public record CreateMatchPlayerInput(Guid PlayerId, bool HasSpecialTag);

public record CreateMatchCommand(
    DateOnly Date,
    string TeamAName,
    string TeamBName,
    int ScoreA,
    int ScoreB,
    List<CreateMatchPlayerInput> TeamA,
    List<CreateMatchPlayerInput> TeamB
) : IRequest<Guid>;

public class CreateMatchCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateMatchCommand, Guid>
{
    public async Task<Guid> Handle(CreateMatchCommand request, CancellationToken cancellationToken)
    {
        if (request.TeamA.Count == 0 || request.TeamB.Count == 0)
            throw new InvalidOperationException("Los dos equipos necesitan al menos un jugador.");

        var allIds = request.TeamA.Select(p => p.PlayerId)
            .Concat(request.TeamB.Select(p => p.PlayerId))
            .ToList();

        // Traemos todos los jugadores reales de la base de datos de una sola vez
        var jugadoresDb = await context.Players
            .Where(p => allIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        if (jugadoresDb.Count != allIds.Distinct().Count())
            throw new InvalidOperationException("Alguno de los jugadores no existe o está repetido.");

        var match = new Match(request.Date, request.TeamAName, request.TeamBName, request.ScoreA, request.ScoreB);

        foreach (var p in request.TeamA)
            match.AddPlayer(p.PlayerId, Team.A, p.HasSpecialTag);

        foreach (var p in request.TeamB)
            match.AddPlayer(p.PlayerId, Team.B, p.HasSpecialTag);

        context.Matches.Add(match);

        // --- INICIO LÓGICA AUTOMÁTICA DE MMR ---
        if (request.ScoreA != request.ScoreB) // Si no fue un empate
        {
            var ganadoresIds = request.ScoreA > request.ScoreB 
                ? request.TeamA.Select(t => t.PlayerId).ToList() 
                : request.TeamB.Select(t => t.PlayerId).ToList();

            var perdedoresIds = request.ScoreA > request.ScoreB 
                ? request.TeamB.Select(t => t.PlayerId).ToList() 
                : request.TeamA.Select(t => t.PlayerId).ToList();

            int diferenciaGoles = Math.Abs(request.ScoreA - request.ScoreB);
            int puntosEnJuego = 15 + (diferenciaGoles * 2);

            foreach (var jugador in jugadoresDb)
            {
                if (ganadoresIds.Contains(jugador.Id))
                {
                    jugador.UpdateMmr(puntosEnJuego); // Suma si ganó
                }
                else if (perdedoresIds.Contains(jugador.Id))
                {
                    jugador.UpdateMmr(-puntosEnJuego); // Resta si perdió
                }
            }
        }
        // --- FIN LÓGICA AUTOMÁTICA DE MMR ---

        await context.SaveChangesAsync(cancellationToken);

        return match.Id;
    }
}