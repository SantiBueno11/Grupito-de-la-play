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

        var existingCount = await context.Players
            .CountAsync(p => allIds.Contains(p.Id), cancellationToken);

        if (existingCount != allIds.Distinct().Count())
            throw new InvalidOperationException("Alguno de los jugadores no existe o está repetido.");

        var match = new Match(request.Date, request.TeamAName, request.TeamBName, request.ScoreA, request.ScoreB);

        foreach (var p in request.TeamA)
            match.AddPlayer(p.PlayerId, Team.A, p.HasSpecialTag);

        foreach (var p in request.TeamB)
            match.AddPlayer(p.PlayerId, Team.B, p.HasSpecialTag);

        context.Matches.Add(match);
        await context.SaveChangesAsync(cancellationToken);

        return match.Id;
    }
}
