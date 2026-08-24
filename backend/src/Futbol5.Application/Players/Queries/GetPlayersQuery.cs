using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Players.Queries;

public record GetPlayersQuery : IRequest<List<PlayerDto>>;

public class GetPlayersQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetPlayersQuery, List<PlayerDto>>
{
    public async Task<List<PlayerDto>> Handle(GetPlayersQuery request, CancellationToken cancellationToken)
    {
        return await context.Players
            .OrderBy(p => p.Name)
            .Select(p => new PlayerDto(p.Id, p.Name, p.PhotoUrl, p.Rating, p.Mmr, p.Rank, p.EsDelGrupo))
            .ToListAsync(cancellationToken);
    }
}