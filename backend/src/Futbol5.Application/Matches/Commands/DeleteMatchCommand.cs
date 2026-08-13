using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Commands;

public record DeleteMatchCommand(Guid MatchId) : IRequest<bool>;

public class DeleteMatchCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteMatchCommand, bool>
{
    public async Task<bool> Handle(DeleteMatchCommand request, CancellationToken cancellationToken)
    {
        var match = await context.Matches
            .FirstOrDefaultAsync(m => m.Id == request.MatchId, cancellationToken);

        if (match is null) return false;

        context.Matches.Remove(match);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
