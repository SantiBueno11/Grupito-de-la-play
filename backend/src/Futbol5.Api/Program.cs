using Futbol5.Api.Endpoints;
using Futbol5.Application;
using Futbol5.Infrastructure;
using Futbol5.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<Futbol5.Application.Common.Interfaces.ICurrentUserService, Futbol5.Api.Services.CurrentUserService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var db = services.GetRequiredService<Futbol5DbContext>();
        db.Database.Migrate();

        // Fix PostgreSQL sequences that might be out of sync due to hardcoded IDs
        try 
        {
            db.Database.ExecuteSqlRaw(@"
                DO $$
                DECLARE
                    max_gs integer;
                    max_us integer;
                BEGIN
                    SELECT coalesce(max(""Id""), 0) INTO max_gs FROM ""GroupSettings"";
                    PERFORM setval('""GroupSettings_Id_seq""', max_gs + 1, false);
                    
                    SELECT coalesce(max(""Id""), 0) INTO max_us FROM ""Users"";
                    PERFORM setval('""Users_Id_seq""', max_us + 1, false);
                END $$;
            ");
            logger.LogInformation("Migraciones aplicadas correctamente y secuencias sincronizadas.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudieron sincronizar las secuencias. Esto es normal si la base de datos es SQLite.");
        }
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Error crítico durante el arranque (migración).");
        throw;
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = exceptionFeature?.Error;

        logger.LogError(exception, "Excepción no controlada en {Path}", context.Request.Path);

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var payload = app.Environment.IsDevelopment()
            ? new { error = exception?.Message ?? "Error desconocido", stackTrace = exception?.StackTrace }
            : new { error = "Ocurrió un error interno.", stackTrace = (string?)null };

        await context.Response.WriteAsJsonAsync(payload);
    });
});

app.MapGet("/", () => "Futbol5 API está corriendo ⚽");

app.MapPlayersEndpoints();
app.MapMatchesEndpoints();
app.MapGroupSettingsEndpoints();
app.MapAuthEndpoints();
app.MapDashboardEndpoints();

app.Run();