using Futbol5.Api.Endpoints;
using Futbol5.Application;
using Futbol5.Application.Matches.Commands; // Import necesario para el comando
using Futbol5.Infrastructure;
using Futbol5.Infrastructure.Persistence;
using MediatR; // Import necesario para el Mediator
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
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// --- Migraciones y Recálculo de MMR al arrancar ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    
    // 1. Aplicar migraciones
    var db = services.GetRequiredService<Futbol5DbContext>();
    db.Database.Migrate(); 

    // 2. Recalcular todo el MMR usando el historial existente al arrancar
    var mediator = services.GetRequiredService<IMediator>();
    await mediator.Send(new RecalculateMmrCommand());
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