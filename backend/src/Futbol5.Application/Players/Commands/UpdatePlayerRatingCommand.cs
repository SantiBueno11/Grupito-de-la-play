using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Players.Commands;

public record UpdatePlayerRatingCommand(Guid PlayerId, int? Rating) : IRequest<bool>;

public class UpdatePlayerRatingCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdatePlayerRatingCommand, bool>
{
    public async Task<bool> Handle(UpdatePlayerRatingCommand request, CancellationToken cancellationToken)
    {
        var player = await context.Players
            .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken);

        if (player is null) return false;

        player.SetRating(request.Rating);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}