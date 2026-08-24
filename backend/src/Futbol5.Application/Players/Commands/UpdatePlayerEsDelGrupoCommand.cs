using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Players.Commands;

public record UpdatePlayerEsDelGrupoCommand(Guid PlayerId, bool EsDelGrupo) : IRequest<bool>;

public class UpdatePlayerEsDelGrupoCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdatePlayerEsDelGrupoCommand, bool>
{
    public async Task<bool> Handle(UpdatePlayerEsDelGrupoCommand request, CancellationToken cancellationToken)
    {
        var player = await context.Players
            .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken);

        if (player is null) return false;

        player.SetEsDelGrupo(request.EsDelGrupo);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}