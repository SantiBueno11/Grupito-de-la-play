using Futbol5.Application.Common.Interfaces;
using Futbol5.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Infrastructure.Persistence;

public class Futbol5DbContext : DbContext, IApplicationDbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public Futbol5DbContext(
        DbContextOptions<Futbol5DbContext> options,
        ICurrentUserService? currentUserService = null)
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<Player> Players => Set<Player>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<MatchPlayer> MatchPlayers => Set<MatchPlayer>();
    public DbSet<GroupSettingsEntity> GroupSettings => Set<GroupSettingsEntity>();
    public DbSet<UserEntity> Users => Set<UserEntity>();

    private int? CurrentUserId => _currentUserService?.UserId;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Futbol5DbContext).Assembly);

        // Global Query Filters para Multi-Tenancy
        modelBuilder.Entity<Player>().HasQueryFilter(p => CurrentUserId == null || p.UserId == CurrentUserId);
        modelBuilder.Entity<Match>().HasQueryFilter(m => CurrentUserId == null || m.UserId == CurrentUserId);
        modelBuilder.Entity<GroupSettingsEntity>().HasQueryFilter(g => CurrentUserId == null || g.UserId == CurrentUserId);

        base.OnModelCreating(modelBuilder);
    }

    public override int SaveChanges()
    {
        ApplyUserId();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyUserId();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyUserId()
    {
        var userId = _currentUserService?.UserId;
        if (!userId.HasValue) return;

        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added);

        foreach (var entry in entries)
        {
            if (entry.Entity is Player player) player.UserId = userId.Value;
            if (entry.Entity is Match match) match.UserId = userId.Value;
            if (entry.Entity is GroupSettingsEntity group) group.UserId = userId.Value;
        }
    }
}