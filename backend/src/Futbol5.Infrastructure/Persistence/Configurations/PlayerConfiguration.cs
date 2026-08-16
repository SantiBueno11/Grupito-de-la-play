using Futbol5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Futbol5.Infrastructure.Persistence.Configurations;

public class PlayerConfiguration : IEntityTypeConfiguration<Player>
{
    public void Configure(EntityTypeBuilder<Player> builder)
    {
        builder.ToTable("Players");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id).HasConversion<string>();

        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        builder.Property(p => p.PhotoUrl);
        builder.Property(p => p.Rating);
        builder.HasIndex(p => p.Name).IsUnique();
    }
}