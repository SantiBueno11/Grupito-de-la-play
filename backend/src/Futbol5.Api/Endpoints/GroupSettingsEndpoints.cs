using Futbol5.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Api.Endpoints;

public static class GroupSettingsEndpoints
{
    public static void MapGroupSettingsEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/settings")
            .WithTags("Group Settings");

        // GET: Obtener la configuración del grupo
        group.MapGet("/", async (Futbol5DbContext db) =>
        {
            var settings = await db.Set<GroupSettingsEntity>().FirstOrDefaultAsync(s => s.Id == 1);
            
            if (settings == null)
            {
                settings = new GroupSettingsEntity();
                db.Set<GroupSettingsEntity>().Add(settings);
                await db.SaveChangesAsync();
            }

            return Results.Ok(settings);
        });

        // PUT: Actualizar la configuración del grupo
        group.MapPut("/", async (GroupSettingsEntity inputSettings, Futbol5DbContext db) =>
        {
            var settings = await db.Set<GroupSettingsEntity>().FirstOrDefaultAsync(s => s.Id == 1);

            if (settings == null)
            {
                settings = new GroupSettingsEntity();
                db.Set<GroupSettingsEntity>().Add(settings);
            }

            settings.Name = inputSettings.Name;
            settings.Description = inputSettings.Description;
            settings.PhotoUrl = inputSettings.PhotoUrl;

            await db.SaveChangesAsync();

            return Results.Ok(settings);
        });
    }
}

// Entidad temporal para los ajustes si prefieres tenerla aquí o en tu capa de infraestructura
public class GroupSettingsEntity
{
    public int Id { get; set; } = 1;
    public string Name { get; set; } = "Grupito de la Play";
    public string Description { get; set; } = "Registro de partidos, plantel y tabla de la semana";
    public string PhotoUrl { get; set; } = string.Empty;
}