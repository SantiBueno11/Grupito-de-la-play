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
            // Equipo A: solo los que jugaron de verdad (Asistio = true).
            // Los ausentes quedan con Team = A por un detalle interno,
            // pero NO son parte del roster que jugó.
            m.MatchPlayers.Where(mp => mp.Team == Team.A && mp.Asistio)
                .Select(mp => new MatchPlayerDto(mp.PlayerId, mp.Player!.Name, mp.Player!.PhotoUrl, mp.HasSpecialTag))
                .ToList(),
            m.MatchPlayers.Where(mp => mp.Team == Team.B && mp.Asistio)
                .Select(mp => new MatchPlayerDto(mp.PlayerId, mp.Player!.Name, mp.Player!.PhotoUrl, mp.HasSpecialTag))
                .ToList(),
            // Ausentes: cualquiera marcado con Asistio = false, sin importar
            // el Team que le haya quedado asignado internamente.
            m.MatchPlayers.Where(mp => !mp.Asistio)
                .Select(mp => new MatchPlayerDto(mp.PlayerId, mp.Player!.Name, mp.Player!.PhotoUrl, mp.HasSpecialTag))
                .ToList()
        )).ToList();
    }
}