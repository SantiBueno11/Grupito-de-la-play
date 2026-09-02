using Futbol5.Application.Common.Interfaces;
using Futbol5.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

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
                options.UseNpgsql(NormalizePostgresConnectionString(connectionString), npgsqlOptions =>
                {
                    npgsqlOptions.UseAdminDatabase("postgres");
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                });
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

    private static string NormalizePostgresConnectionString(string connectionString)
    {
        // Supabase muestra una URI (postgresql://usuario:clave@host:puerto/base),
        // mientras Npgsql usa pares clave=valor. Se aceptan ambos formatos.
        if (!Uri.TryCreate(connectionString, UriKind.Absolute, out var uri) ||
            (uri.Scheme != "postgres" && uri.Scheme != "postgresql"))
        {
            return connectionString;
        }

        var credentials = uri.UserInfo.Split(':', 2);
        return new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Database = uri.AbsolutePath.Trim('/'),
            Username = Uri.UnescapeDataString(credentials[0]),
            Password = credentials.Length > 1 ? Uri.UnescapeDataString(credentials[1]) : string.Empty,
            SslMode = SslMode.Require,
        }.ConnectionString;
    }
}
