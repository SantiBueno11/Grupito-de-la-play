using Futbol5.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Player> Players { get; }
    DbSet<Match> Matches { get; }
    DbSet<MatchPlayer> MatchPlayers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
