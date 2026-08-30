using Futbol5.Domain.Entities;
using Futbol5.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        // Registro de usuario
        app.MapPost("/api/auth/register", async (RegisterDto dto, Futbol5DbContext db) =>
        {
            var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (existingUser != null)
            {
                return Results.BadRequest(new { message = "El usuario ya existe" });
            }

            var newUser = new UserEntity
            {
                Username = dto.Username,
                PasswordHash = dto.Password
            };

            db.Users.Add(newUser);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Usuario registrado correctamente" });
        });

        // Inicio de sesión
        app.MapPost("/api/auth/login", async (LoginDto dto, Futbol5DbContext db) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username && u.PasswordHash == dto.Password);
            if (user == null)
            {
                return Results.BadRequest(new { message = "Usuario o contraseña incorrectos" });
            }

            return Results.Ok(new { message = "Login exitoso", username = user.Username });
        });
    }
}

public record RegisterDto(string Username, string Password);
public record LoginDto(string Username, string Password);