using Futbol5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Futbol5.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Player> Players { get; }
    DbSet<Match> Matches { get; }
    DbSet<MatchPlayer> MatchPlayers { get; }

    // Necesario para poder limpiar entidades trackeadas en memoria
    // después de un bulk update (ExecuteUpdateAsync), y así evitar
    // que una query posterior en el mismo scope devuelva datos viejos.
    ChangeTracker ChangeTracker { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}