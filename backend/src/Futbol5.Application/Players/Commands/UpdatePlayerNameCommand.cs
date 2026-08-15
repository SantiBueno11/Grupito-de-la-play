using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Players.Commands;

public record UpdatePlayerNameCommand(Guid PlayerId, string Name) : IRequest<bool>;

public class UpdatePlayerNameCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdatePlayerNameCommand, bool>
{
    public async Task<bool> Handle(UpdatePlayerNameCommand request, CancellationToken cancellationToken)
    {
        var trimmedName = request.Name.Trim();

        var nameTaken = await context.Players
            .AnyAsync(p => p.Id != request.PlayerId && p.Name.ToLower() == trimmedName.ToLower(), cancellationToken);

        if (nameTaken)
            throw new InvalidOperationException($"Ya existe un jugador llamado '{trimmedName}'.");

        var player = await context.Players
            .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken);

        if (player is null) return false;

        player.Rename(request.Name);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}