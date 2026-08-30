using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Infrastructure.Persistence;

public class Futbol5DbContext(DbContextOptions<Futbol5DbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<Player> Players => Set<Player>();

    public DbSet<Match> Matches => Set<Match>();

    public DbSet<MatchPlayer> MatchPlayers => Set<MatchPlayer>();

    public DbSet<GroupSettingsEntity> GroupSettings => Set<GroupSettingsEntity>();

    public DbSet<UserEntity> Users => Set<UserEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(Futbol5DbContext).Assembly
        );

        base.OnModelCreating(modelBuilder);
    }
}