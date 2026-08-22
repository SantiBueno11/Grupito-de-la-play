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

        // Nota: p.Rank es una propiedad C# calculada (switch sobre Mmr),
        // no una columna real, asi que no se puede traducir a SQL. Por
        // eso materializamos los jugadores primero y armamos el DTO en
        // memoria.
        var players = await context.Players
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        // "Partidos jugados" = veces que el jugador asistio. Contamos
        // directo sobre MatchPlayers (GroupBy) en vez de usar la
        // navegacion Player.MatchPlayers: es una query mas simple y
        // evita cualquier problema de materializacion de la coleccion
        // (backing field privado) combinado con AsNoTracking.
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
                p.Rank, // Rank ya viene calculado desde la entidad Player
                p.Mmr,
                gamesPlayedByPlayer.TryGetValue(p.Id, out var count) ? count : 0
            ))
            .OrderByDescending(m => m.Mmr)
            .ToList();
    }
}