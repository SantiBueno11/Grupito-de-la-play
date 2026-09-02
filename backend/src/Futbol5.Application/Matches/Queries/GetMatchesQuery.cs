using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Queries;

public record GetMatchesQuery : IRequest<List<MatchDto>>;

public class GetMatchesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMatchesQuery, List<MatchDto>>
{
    public async Task<List<MatchDto>> Handle(GetMatchesQuery request, CancellationToken cancellationToken)
    {
        var matches = await context.Matches
            .AsNoTracking()
            .Include(m => m.MatchPlayers)
            .ThenInclude(mp => mp.Player)
            .OrderByDescending(m => m.Date)
            .ThenByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        return matches.Select(m => new MatchDto(
            m.Id,
            m.Date,
            m.CreatedAt,
            m.TeamAName,
            m.TeamBName,
            m.ScoreA,
            m.ScoreB,
            m.MatchPlayers.Where(mp => mp.Team == Team.A && mp.Asistio)
                .Select(mp => new MatchPlayerDto(mp.PlayerId, mp.Player!.Name, mp.Player!.PhotoUrl, mp.HasSpecialTag))
                .ToList(),
            m.MatchPlayers.Where(mp => mp.Team == Team.B && mp.Asistio)
                .Select(mp => new MatchPlayerDto(mp.PlayerId, mp.Player!.Name, mp.Player!.PhotoUrl, mp.HasSpecialTag))
                .ToList(),
            m.MatchPlayers.Where(mp => !mp.Asistio)
                .Select(mp => new MatchPlayerDto(mp.PlayerId, mp.Player!.Name, mp.Player!.PhotoUrl, mp.HasSpecialTag))
                .ToList()
        )).ToList();
    }
}