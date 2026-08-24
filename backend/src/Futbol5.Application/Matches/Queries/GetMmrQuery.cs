using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Queries;

public record GetMmrQuery : IRequest<List<MmrEntryDto>>;

public class GetMmrQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMmrQuery, List<MmrEntryDto>>
{
    public async Task<List<MmrEntryDto>> Handle(GetMmrQuery request, CancellationToken cancellationToken)
    {
        // Lee directamente el Mmr persistido (el que sí contempla
        // asistencias/penalizaciones vía RecalculateMmrCommandHandler),
        // en vez de recalcular un Elo aparte en memoria como hacia antes.
        // Solo los jugadores "del grupo" (EsDelGrupo = true) entran acá:
        // los invitados/reemplazos ocasionales no compiten en la tabla.

        var players = await context.Players
            .AsNoTracking()
            .Where(p => p.EsDelGrupo)
            .ToListAsync(cancellationToken);

        var gamesPlayedByPlayer = await context.MatchPlayers
            .Where(mp => mp.Asistio)
            .GroupBy(mp => mp.PlayerId)
            .Select(g => new { PlayerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PlayerId, x => x.Count, cancellationToken);

        return players
            .Select(p => new MmrEntryDto(
                p.Id,
                p.Name,
                p.PhotoUrl,
                p.Rank,
                p.Mmr,
                gamesPlayedByPlayer.TryGetValue(p.Id, out var count) ? count : 0
            ))
            .OrderByDescending(m => m.Mmr)
            .ToList();
    }
}