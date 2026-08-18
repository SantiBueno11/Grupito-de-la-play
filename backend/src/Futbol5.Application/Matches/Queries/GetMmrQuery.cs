using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Queries;

// Sistema de puntaje tipo Elo, calculado al vuelo (no se guarda nada extra en la base).
// Todos arrancan en 1000. Después de cada partido, según qué tan sorpresivo fue el
// resultado y por cuántos goles de diferencia, el equipo ganador suma y el perdedor
// resta — más si la diferencia de goles fue grande, menos si fue apretado.
public record GetMmrQuery : IRequest<List<MmrEntryDto>>;

public class GetMmrQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMmrQuery, List<MmrEntryDto>>
{
    private const double BaseRating = 1000;
    private const double K = 32; // qué tan grandes son los cambios de puntaje por partido

    public async Task<List<MmrEntryDto>> Handle(GetMmrQuery request, CancellationToken cancellationToken)
    {
        var players = await context.Players.ToListAsync(cancellationToken);

        var matches = await context.Matches
            .Include(m => m.MatchPlayers)
            .OrderBy(m => m.Date)
            .ThenBy(m => m.Id)
            .ToListAsync(cancellationToken);

        var ratings = players.ToDictionary(p => p.Id, _ => BaseRating);
        var played = players.ToDictionary(p => p.Id, _ => 0);

        foreach (var match in matches)
        {
            var teamAIds = match.MatchPlayers.Where(mp => mp.Team == Team.A).Select(mp => mp.PlayerId)
                .Where(ratings.ContainsKey).ToList();
            var teamBIds = match.MatchPlayers.Where(mp => mp.Team == Team.B).Select(mp => mp.PlayerId)
                .Where(ratings.ContainsKey).ToList();

            if (teamAIds.Count == 0 || teamBIds.Count == 0) continue;

            var avgA = teamAIds.Average(id => ratings[id]);
            var avgB = teamBIds.Average(id => ratings[id]);

            // Probabilidad "esperada" de que gane el equipo A, según la diferencia de puntaje actual.
            var expectedA = 1.0 / (1.0 + Math.Pow(10, (avgB - avgA) / 400.0));

            double actualA = match.ScoreA == match.ScoreB ? 0.5 : (match.ScoreA > match.ScoreB ? 1.0 : 0.0);

            // Ganar por 1 gol no suma lo mismo que ganar por 10.
            var goalDiff = Math.Abs(match.ScoreA - match.ScoreB);
            var marginMultiplier = Math.Min(1.0 + Math.Max(0, goalDiff - 1) * 0.1, 2.5);

            var delta = K * marginMultiplier * (actualA - expectedA);

            foreach (var id in teamAIds) { ratings[id] = Math.Max(100, ratings[id] + delta); played[id]++; }
            foreach (var id in teamBIds) { ratings[id] = Math.Max(100, ratings[id] - delta); played[id]++; }
        }

        return players
            .Select(p => new MmrEntryDto(
                p.Id,
                p.Name,
                p.PhotoUrl,
                (int)Math.Round(ratings[p.Id]),
                TierFor(ratings[p.Id]),
                played[p.Id]
            ))
            .OrderByDescending(m => m.Rating)
            .ToList();
    }

    private static string TierFor(double rating) => rating switch
    {
        < 900 => "Bronce",
        < 1100 => "Plata",
        < 1300 => "Oro",
        < 1500 => "Platino",
        _ => "Diamante",
    };
}