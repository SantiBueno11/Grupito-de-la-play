using Futbol5.Api.Endpoints;
using Futbol5.Application;
using Futbol5.Infrastructure;
using Futbol5.Infrastructure.Persistence;
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

// --- CONFIGURACIÓN DE CORS (Actualizada para producción) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.AllowAnyOrigin()   // <-- Esto soluciona el bloqueo en Render
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// --- Migraciones automáticas al arrancar (útil para deploy) ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<Futbol5DbContext>();
    // IMPORTANTE: Esto requiere que la base de datos de producción esté configurada correctamente en Render
    db.Database.Migrate(); 
}

// --- Middleware ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

app.MapGet("/", () => "Futbol5 API está corriendo ⚽");

app.MapPlayersEndpoints();
app.MapMatchesEndpoints();

app.Run();