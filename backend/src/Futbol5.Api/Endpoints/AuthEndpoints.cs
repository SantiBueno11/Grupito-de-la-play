using Futbol5.Domain.Entities;
using Futbol5.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Futbol5.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        // Registro de usuario
        app.MapPost("/api/auth/register", async (RegisterDto dto, Futbol5DbContext db) =>
        {
            var username = dto.Username.Trim();
            if (string.IsNullOrWhiteSpace(username) || dto.Password.Length < 8)
            {
                return Results.BadRequest(new { message = "El usuario es obligatorio y la contraseña debe tener al menos 8 caracteres" });
            }

            var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (existingUser != null)
            {
                return Results.BadRequest(new { message = "El usuario ya existe" });
            }

            var newUser = new UserEntity
            {
                Username = username,
                PasswordHash = PasswordHasher.Hash(dto.Password)
            };

            db.Users.Add(newUser);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Usuario registrado correctamente", username = newUser.Username, userId = newUser.Id });
        });

        // Inicio de sesión
        app.MapPost("/api/auth/login", async (LoginDto dto, Futbol5DbContext db) =>
        {
            var username = dto.Username.Trim();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null || !PasswordHasher.Verify(dto.Password, user.PasswordHash, out var mustUpgradeHash))
            {
                return Results.BadRequest(new { message = "Usuario o contraseña incorrectos" });
            }

            if (mustUpgradeHash)
            {
                user.PasswordHash = PasswordHasher.Hash(dto.Password);
                await db.SaveChangesAsync();
            }

            return Results.Ok(new { message = "Login exitoso", username = user.Username, userId = user.Id });
        });
    }
}

public record RegisterDto(string Username, string Password);
public record LoginDto(string Username, string Password);

internal static class PasswordHasher
{
    private const int Iterations = 210_000;
    private const int SaltSize = 16;
    private const int HashSize = 32;

    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA512, HashSize);
        return $"pbkdf2-sha512.{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string password, string storedValue, out bool mustUpgradeHash)
    {
        mustUpgradeHash = false;
        var parts = storedValue.Split('.');

        if (parts.Length == 4 &&
            parts[0] == "pbkdf2-sha512" &&
            int.TryParse(parts[1], out var iterations))
        {
            try
            {
                var salt = Convert.FromBase64String(parts[2]);
                var expectedHash = Convert.FromBase64String(parts[3]);
                var actualHash = Rfc2898DeriveBytes.Pbkdf2(
                    password, salt, iterations, HashAlgorithmName.SHA512, expectedHash.Length);
                return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
            }
            catch (FormatException)
            {
                return false;
            }
        }

        // Compatibilidad temporal con contraseñas antiguas almacenadas en texto plano.
        mustUpgradeHash = true;
        var supplied = Encoding.UTF8.GetBytes(password);
        var legacyValue = Encoding.UTF8.GetBytes(storedValue);
        return supplied.Length == legacyValue.Length && CryptographicOperations.FixedTimeEquals(supplied, legacyValue);
    }
}
