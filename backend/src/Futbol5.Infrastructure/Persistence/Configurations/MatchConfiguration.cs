using Futbol5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Futbol5.Infrastructure.Persistence.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.ToTable("Matches");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasConversion<string>();

        builder.Property(m => m.Date)
            .HasConversion(
                d => d.ToString("yyyy-MM-dd"),
                s => DateOnly.Parse(s));

        builder.Property(m => m.CreatedAt).IsRequired();

        builder.Property(m => m.TeamAName).IsRequired().HasMaxLength(50);
        builder.Property(m => m.TeamBName).IsRequired().HasMaxLength(50);

        builder.HasMany(m => m.MatchPlayers)
            .WithOne(mp => mp.Match)
            .HasForeignKey(mp => mp.MatchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}