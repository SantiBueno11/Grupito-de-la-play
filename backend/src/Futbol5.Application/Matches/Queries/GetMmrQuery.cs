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
        // Antes: este handler recalculaba un rating Elo desde cero, en
        // memoria, cada vez que se pedía. Eso ignoraba por completo el
        // Mmr persistido en la base (el que sí contempla asistencias y
        // penalizaciones vía RecalculateMmrCommandHandler). Ahora lee
        // directamente los valores ya calculados: una sola fuente de verdad.

        // Nota: p.Rank es una propiedad C# calculada (switch sobre Mmr),
        // no una columna real, así que no se puede traducir a SQL dentro
        // de un Select(). Por eso materializamos los jugadores primero
        // y armamos el DTO en memoria.
        var players = await context.Players
            .AsNoTracking()
            .Include(p => p.MatchPlayers)
            .ToListAsync(cancellationToken);

        return players
            .Select(p => new MmrEntryDto(
                p.Id,
                p.Name,
                p.PhotoUrl,
                p.Rank, // Rank ya viene calculado desde la entidad Player
                p.Mmr,
                p.MatchPlayers.Count(mp => mp.Asistio) // partidos jugados = a los que asistió
            ))
            .OrderByDescending(m => m.Mmr)
            .ToList();
    }
}