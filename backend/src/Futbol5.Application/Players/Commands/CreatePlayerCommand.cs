using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Players.Commands;

public record CreatePlayerCommand(string Name, string? PhotoUrl = null) : IRequest<PlayerDto>;

public class CreatePlayerCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreatePlayerCommand, PlayerDto>
{
    public async Task<PlayerDto> Handle(CreatePlayerCommand request, CancellationToken cancellationToken)
    {
        var trimmedName = request.Name.Trim();

        var nameExists = await context.Players
            .AnyAsync(p => p.Name.ToLower() == trimmedName.ToLower(), cancellationToken);

        if (nameExists)
            throw new InvalidOperationException($"Ya existe un jugador llamado '{trimmedName}'.");

        var player = new Player(request.Name, request.PhotoUrl);
        context.Players.Add(player);
        await context.SaveChangesAsync(cancellationToken);

        // ACÁ ESTABA EL DETALLE: Agregamos player.Mmr y player.Rank
        return new PlayerDto(player.Id, player.Name, player.PhotoUrl, player.Rating, player.Mmr, player.Rank);
    }
}