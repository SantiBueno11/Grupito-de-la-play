using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Queries;

public record GetMmrQuery : IRequest<List<MmrEntryDto>>;

public class GetMmrQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMmrQuery, List<MmrEntryDto>>
{
    private const double BaseRating = 1000;
    private const double K = 32;

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

            var expectedA = 1.0 / (1.0 + Math.Pow(10, (avgB - avgA) / 400.0));

            double actualA = match.ScoreA == match.ScoreB ? 0.5 : (match.ScoreA > match.ScoreB ? 1.0 : 0.0);

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
                TierFor(ratings[p.Id]),        // Corresponde a Rank (string)
                (int)Math.Round(ratings[p.Id]),// Corresponde a Mmr (int)
                played[p.Id]                   // Corresponde a GamesPlayed (int)
            ))
            .OrderByDescending(m => m.Mmr)
            .ToList();
    }

    private static string TierFor(double rating) => rating switch
    {
        < 900 => "Bronce",
        < 1050 => "Plata",
        < 1200 => "Oro",
        < 1350 => "Platino",
        < 1500 => "Diamante",
        < 1650 => "Campeón",
        < 1800 => "Gran Campeón",
        _ => "Leyenda",
    };
}