using Futbol5.Api.Endpoints;
using Futbol5.Application;
using Futbol5.Application.Matches.Commands;
using Futbol5.Infrastructure;
using Futbol5.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- Servicios ---
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB, para fotos en base64
});

// --- CONFIGURACIÓN DE CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Permite credenciales/cookies si las usas
    });
});

var app = builder.Build();

// --- Migraciones y Recálculo de MMR al arrancar ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        // 1. Aplicar migraciones
        var db = services.GetRequiredService<Futbol5DbContext>();
        db.Database.Migrate();
        logger.LogInformation("Migraciones aplicadas correctamente.");

        // 2. Recalcular todo el MMR usando el historial existente al arrancar
        var mediator = services.GetRequiredService<IMediator>();
        await mediator.Send(new RecalculateMmrCommand());
        logger.LogInformation("Recalculo de MMR completado.");
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Error crítico durante el arranque (migración o recálculo de MMR).");
        throw;
    }
}

// --- Middleware ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

// --- Manejador de excepciones global ---
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
app.MapAuthEndpoints(); // <--- Endpoints de Login y Registro integrados

app.Run();