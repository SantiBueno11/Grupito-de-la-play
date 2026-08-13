using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Players.Commands;

public record DeletePlayerCommand(Guid PlayerId) : IRequest<bool>;

public class DeletePlayerCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeletePlayerCommand, bool>
{
    public async Task<bool> Handle(DeletePlayerCommand request, CancellationToken cancellationToken)
    {
        var player = await context.Players
            .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken);

        if (player is null) return false;

        context.Players.Remove(player);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
