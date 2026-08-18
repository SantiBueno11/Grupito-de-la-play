using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Commands;

public record RegisterMatchResultCommand(
    List<Guid> GanadoresIds, 
    List<Guid> PerdedoresIds, 
    int GolesGanador, 
    int GolesPerdedor
) : IRequest<bool>;

// Usamos la interfaz IApplicationDbContext igual que en el resto de tu app
public class RegisterMatchResultCommandHandler(IApplicationDbContext context) 
    : IRequestHandler<RegisterMatchResultCommand, bool>
{
    public async Task<bool> Handle(RegisterMatchResultCommand request, CancellationToken cancellationToken)
    {
        var ganadores = await context.Players
            .Where(p => request.GanadoresIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        var perdedores = await context.Players
            .Where(p => request.PerdedoresIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        // Fórmula MMR
        int diferenciaGoles = request.GolesGanador - request.GolesPerdedor;
        int puntosEnJuego = 15 + (diferenciaGoles * 2);

        foreach (var jugador in ganadores)
        {
            jugador.UpdateMmr(puntosEnJuego);
        }

        foreach (var jugador in perdedores)
        {
            jugador.UpdateMmr(-puntosEnJuego); 
        }

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}