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
    private const double InitialMmr = 1000;
    private const double KFactor = 32;

    public async Task<List<MmrEntryDto>> Handle(
        GetMmrQuery request,
        CancellationToken cancellationToken)
    {
        var players = await context.Players
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.PhotoUrl
            })
            .ToListAsync(cancellationToken);

        var matches = await context.Matches
            .Include(m => m.MatchPlayers)
            .OrderBy(m => m.Date)
            .ThenBy(m => m.Id)
            .ToListAsync(cancellationToken);

        var mmr = players.ToDictionary(
            player => player.Id,
            _ => InitialMmr
        );

        var stats = players.ToDictionary(
            player => player.Id,
            _ => new PlayerMmrStats()
        );

        foreach (var match in matches)
        {
            var teamA = match.MatchPlayers
                .Where(mp =>
                    mp.Team == Team.A &&
                    mmr.ContainsKey(mp.PlayerId))
                .ToList();

            var teamB = match.MatchPlayers
                .Where(mp =>
                    mp.Team == Team.B &&
                    mmr.ContainsKey(mp.PlayerId))
                .ToList();

            if (teamA.Count == 0 || teamB.Count == 0)
                continue;

            var teamAMmr = teamA
                .Average(mp => mmr[mp.PlayerId]);

            var teamBMmr = teamB
                .Average(mp => mmr[mp.PlayerId]);

            var expectedTeamA =
                1 / (1 + Math.Pow(
                    10,
                    (teamBMmr - teamAMmr) / 400));

            var actualTeamA = match.ScoreA.CompareTo(match.ScoreB) switch
            {
                > 0 => 1,
                < 0 => 0,
                _ => 0.5
            };

            var actualTeamB = 1 - actualTeamA;

            var teamAChange =
                KFactor * (actualTeamA - expectedTeamA);

            var expectedTeamB = 1 - expectedTeamA;

            var teamBChange =
                KFactor * (actualTeamB - expectedTeamB);

            foreach (var matchPlayer in teamA)
            {
                mmr[matchPlayer.PlayerId] += teamAChange;

                stats[matchPlayer.PlayerId]
                    .Record(match.ScoreA.CompareTo(match.ScoreB));
            }

            foreach (var matchPlayer in teamB)
            {
                mmr[matchPlayer.PlayerId] += teamBChange;

                stats[matchPlayer.PlayerId]
                    .Record(match.ScoreB.CompareTo(match.ScoreA));
            }
        }

        return players
            .Select(player =>
            {
                var playerStats = stats[player.Id];

                return new MmrEntryDto(
                    player.Id,
                    player.Name,
                    player.PhotoUrl,
                    Math.Round(mmr[player.Id], 2),
                    playerStats.GamesPlayed,
                    playerStats.Wins,
                    playerStats.Losses,
                    playerStats.Draws
                );
            })
            .OrderByDescending(entry => entry.Mmr)
            .ThenBy(entry => entry.PlayerName)
            .ToList();
    }

    private sealed class PlayerMmrStats
    {
        public int GamesPlayed { get; private set; }
        public int Wins { get; private set; }
        public int Losses { get; private set; }
        public int Draws { get; private set; }

        public void Record(int result)
        {
            GamesPlayed++;

            switch (result)
            {
                case > 0:
                    Wins++;
                    break;

                case < 0:
                    Losses++;
                    break;

                default:
                    Draws++;
                    break;
            }
        }
    }
}