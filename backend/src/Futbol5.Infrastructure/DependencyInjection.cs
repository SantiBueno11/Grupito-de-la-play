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
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<Futbol5DbContext>());

        return services;
    }
}
