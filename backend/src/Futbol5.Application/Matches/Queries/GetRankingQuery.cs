using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Queries;

public record GetRankingQuery : IRequest<List<RankingEntryDto>>;

public class GetRankingQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetRankingQuery, List<RankingEntryDto>>
{
    public async Task<List<RankingEntryDto>> Handle(GetRankingQuery request, CancellationToken cancellationToken)
    {
        var matches = await context.Matches
            .Include(m => m.MatchPlayers)
            .ThenInclude(mp => mp.Player)
            .OrderBy(m => m.Date)
            .ThenBy(m => m.Id)
            .ToListAsync(cancellationToken);

        var stats = new Dictionary<Guid, (string Name, string? PhotoUrl, int Played, int Wins, int Losses, int Tags)>();
        var timeline = new Dictionary<Guid, List<bool>>(); // true = ganó ese partido, false = perdió

        foreach (var match in matches)
        {
            foreach (var mp in match.MatchPlayers)
            {
                if (mp.Player is null) continue;

                var won = mp.Team == Team.A ? match.TeamAWon : match.TeamBWon;
                var lost = mp.Team == Team.A ? match.TeamBWon : match.TeamAWon;

                if (!stats.TryGetValue(mp.PlayerId, out var current))
                    current = (mp.Player.Name, mp.Player.PhotoUrl, 0, 0, 0, 0);

                stats[mp.PlayerId] = (
                    current.Name,
                    mp.Player.PhotoUrl,
                    current.Played + 1,
                    current.Wins + (won ? 1 : 0),
                    current.Losses + (lost ? 1 : 0),
                    current.Tags + (mp.HasSpecialTag ? 1 : 0)
                );

                // Solo nos importa ganó/perdió para la racha; los empates no cortan ni suman.
                if (won || lost)
                {
                    if (!timeline.TryGetValue(mp.PlayerId, out var list))
                        timeline[mp.PlayerId] = list = new List<bool>();
                    list.Add(won);
                }
            }
        }

        int ComputeStreak(Guid playerId)
        {
            if (!timeline.TryGetValue(playerId, out var results) || results.Count == 0) return 0;

            var last = results[^1];
            var streak = 0;
            for (var i = results.Count - 1; i >= 0; i--)
            {
                if (results[i] != last) break;
                streak++;
            }
            return last ? streak : -streak;
        }

        return stats.Select(kv => new RankingEntryDto(
            kv.Key,
            kv.Value.Name,
            kv.Value.PhotoUrl,
            kv.Value.Played,
            kv.Value.Wins,
            kv.Value.Losses,
            kv.Value.Played == 0 ? 0 : Math.Round((double)kv.Value.Wins / kv.Value.Played, 4),
            kv.Value.Tags,
            ComputeStreak(kv.Key)
        ))
        .OrderByDescending(r => r.WinRate)
        .ThenByDescending(r => r.Wins)
        .ToList();
    }
}
