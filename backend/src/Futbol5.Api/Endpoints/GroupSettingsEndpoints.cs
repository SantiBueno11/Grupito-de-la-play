using Futbol5.Domain.Entities;
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
            var settings = await db.Set<GroupSettingsEntity>().FirstOrDefaultAsync();

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
            var settings = await db.Set<GroupSettingsEntity>().FirstOrDefaultAsync();

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

// NOTA: la clase GroupSettingsEntity que estaba definida acá se eliminó.
// La entidad real vive en Futbol5.Domain.Entities.GroupSettingsEntity
// (esa es la que está mapeada en el DbContext y tiene su migración aplicada).
// Tener dos clases con el mismo nombre en namespaces distintos es lo que
// causaba el error "Cannot create a DbSet... entity type with the same
// name in a different namespace".
