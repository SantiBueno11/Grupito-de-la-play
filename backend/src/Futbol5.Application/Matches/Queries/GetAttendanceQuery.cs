using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Queries;

// Ojo: "asistencia" se calcula sobre el total de partidos cargados en el sistema.
// Solo cuenta a los jugadores "del grupo" (EsDelGrupo = true); los invitados
// ocasionales no aparecen en esta tabla.
public record GetAttendanceQuery : IRequest<List<AttendanceEntryDto>>;

public class GetAttendanceQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAttendanceQuery, List<AttendanceEntryDto>>
{
    public async Task<List<AttendanceEntryDto>> Handle(GetAttendanceQuery request, CancellationToken cancellationToken)
    {
        var totalMatches = await context.Matches.CountAsync(cancellationToken);

        var players = await context.Players
            .Where(p => p.EsDelGrupo)
            .Select(p => new { p.Id, p.Name, p.PhotoUrl })
            .ToListAsync(cancellationToken);

        var playedCounts = await context.MatchPlayers
            .Where(mp => mp.Asistio)
            .GroupBy(mp => mp.PlayerId)
            .Select(g => new { PlayerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.PlayerId, g => g.Count, cancellationToken);

        return players
            .Select(p =>
            {
                var played = playedCounts.TryGetValue(p.Id, out var c) ? c : 0;
                return new AttendanceEntryDto(
                    p.Id,
                    p.Name,
                    p.PhotoUrl,
                    played,
                    totalMatches,
                    totalMatches - played,
                    totalMatches == 0 ? 0 : Math.Round((double)played / totalMatches, 4)
                );
            })
            .OrderByDescending(a => a.AttendanceRate)
            .ThenByDescending(a => a.GamesPlayed)
            .ToList();
    }
}