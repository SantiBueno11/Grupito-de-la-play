using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Players.Commands;

// PhotoUrl acepta tanto una URL normal como un data URL (base64) generado en el frontend.
public record UpdatePlayerPhotoCommand(Guid PlayerId, string? PhotoUrl) : IRequest<bool>;

public class UpdatePlayerPhotoCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdatePlayerPhotoCommand, bool>
{
    public async Task<bool> Handle(UpdatePlayerPhotoCommand request, CancellationToken cancellationToken)
    {
        var player = await context.Players
            .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken);

        if (player is null) return false;

        player.SetPhoto(request.PhotoUrl);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
