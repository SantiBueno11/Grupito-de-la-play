using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Queries;

public record GetHeadToHeadQuery(Guid PlayerAId, Guid PlayerBId) : IRequest<HeadToHeadDto>;

public class GetHeadToHeadQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetHeadToHeadQuery, HeadToHeadDto>
{
    public async Task<HeadToHeadDto> Handle(GetHeadToHeadQuery request, CancellationToken cancellationToken)
    {
        var playerA = await context.Players.FirstOrDefaultAsync(p => p.Id == request.PlayerAId, cancellationToken)
            ?? throw new InvalidOperationException("No se encontró el primer jugador.");
        var playerB = await context.Players.FirstOrDefaultAsync(p => p.Id == request.PlayerBId, cancellationToken)
            ?? throw new InvalidOperationException("No se encontró el segundo jugador.");

        var matches = await context.Matches
            .Include(m => m.MatchPlayers)
            .Where(m => m.MatchPlayers.Any(mp => mp.PlayerId == request.PlayerAId)
                     && m.MatchPlayers.Any(mp => mp.PlayerId == request.PlayerBId))
            .ToListAsync(cancellationToken);

        int rivals = 0, winsA = 0, winsB = 0, ties = 0, teammates = 0, winsTogether = 0, lossesTogether = 0;

        foreach (var match in matches)
        {
            var teamA = match.MatchPlayers.First(mp => mp.PlayerId == request.PlayerAId).Team;
            var teamB = match.MatchPlayers.First(mp => mp.PlayerId == request.PlayerBId).Team;

            if (teamA == teamB)
            {
                teammates++;
                var won = teamA == Team.A ? match.TeamAWon : match.TeamBWon;
                var lost = teamA == Team.A ? match.TeamBWon : match.TeamAWon;
                if (won) winsTogether++;
                if (lost) lossesTogether++;
            }
            else
            {
                rivals++;
                if (match.ScoreA == match.ScoreB) { ties++; continue; }

                var aWonAsRival = teamA == Team.A ? match.TeamAWon : match.TeamBWon;
                if (aWonAsRival) winsA++; else winsB++;
            }
        }

        return new HeadToHeadDto(
            playerA.Id, playerA.Name, playerA.PhotoUrl,
            playerB.Id, playerB.Name, playerB.PhotoUrl,
            rivals, winsA, winsB, ties,
            teammates, winsTogether, lossesTogether
        );
    }
}
