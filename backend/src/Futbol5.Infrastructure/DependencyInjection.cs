using Futbol5.Application.Common.Interfaces;
using Futbol5.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Futbol5.Infrastructure;

public static class DependencyInjection
{
    // Provider se elige por config: "Sqlite" (default, ideal para desarrollo local)
    // o "Postgres" (para producción, ej. Render/Neon/Supabase).
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var provider = configuration["Database:Provider"] ?? "Sqlite";

        services.AddDbContext<Futbol5DbContext>(options =>
        {
            if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
            {
                var connectionString = configuration.GetConnectionString("Postgres")
                    ?? throw new InvalidOperationException("Falta ConnectionStrings:Postgres en la configuración.");
                options.UseNpgsql(connectionString);
            }
            else
            {
                var connectionString = configuration.GetConnectionString("Sqlite") ?? "Data Source=futbol5.db";
                options.UseSqlite(connectionString);
            }

            // La migración se generó en un momento con SQLite activo; al correr contra otro proveedor
            // (Postgres) EF Core detecta diferencias de anotaciones específicas del proveedor y las marca
            // como "cambios pendientes", aunque el esquema real es correcto. La ignoramos a propósito.
            options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<Futbol5DbContext>());

        return services;
    }
}