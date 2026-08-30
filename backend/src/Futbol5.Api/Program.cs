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
// IMPORTANTE: si esto falla, antes moría en silencio o tiraba la app entera.
// Ahora logueamos el error real para verlo en los logs de Render.
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
        // Esto es clave: si la migración o el recalculo fallan, queremos VERLO
        // en los logs de Render en vez de que la app arranque en un estado roto.
        logger.LogCritical(ex, "Error crítico durante el arranque (migración o recálculo de MMR).");
        throw; // re-lanzamos para que Render marque el deploy como fallido y no quede una app "zombie"
    }
}

// --- Middleware ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS tiene que ir antes que cualquier otro middleware que pueda cortar el pipeline,
// y antes del manejador de excepciones para que los headers se apliquen también en errores.
app.UseCors("Frontend");

// --- Manejador de excepciones global ---
// Sin esto, un error no controlado en un endpoint devuelve un 500 "pelado"
// que en algunos casos no incluye los headers de CORS, generando el falso error de CORS en el navegador.
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

        // En desarrollo devolvemos el detalle, en producción un mensaje genérico.
        // Ambas ramas deben tener la MISMA forma de tipo anónimo (mismas propiedades)
        // para que el compilador pueda unificarlas en el operador ternario.
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

app.Run();