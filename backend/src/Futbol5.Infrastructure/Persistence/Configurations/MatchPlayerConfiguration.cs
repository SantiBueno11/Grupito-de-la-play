using Futbol5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Futbol5.Infrastructure.Persistence.Configurations;

public class MatchPlayerConfiguration : IEntityTypeConfiguration<MatchPlayer>
{
    public void Configure(EntityTypeBuilder<MatchPlayer> builder)
    {
        builder.ToTable("MatchPlayers");
        builder.HasKey(mp => new { mp.MatchId, mp.PlayerId });

        builder.Property(mp => mp.MatchId).HasConversion<string>();
        builder.Property(mp => mp.PlayerId).HasConversion<string>();

        builder.HasOne(mp => mp.Player)
            .WithMany(p => p.MatchPlayers)
            .HasForeignKey(mp => mp.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}