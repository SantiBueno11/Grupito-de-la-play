using Futbol5.Application.Players.Commands;
using Futbol5.Application.Players.Queries;
using MediatR;

namespace Futbol5.Api.Endpoints;

public record UpdatePhotoRequest(string? PhotoUrl);
public record UpdateNameRequest(string Name);
public record UpdateRatingRequest(int? Rating);
public record UpdateEsDelGrupoRequest(bool EsDelGrupo);

public static class PlayersEndpoints
{
    public static void MapPlayersEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/players").WithTags("Players");

        group.MapGet("/", async (IMediator mediator) =>
            Results.Ok(await mediator.Send(new GetPlayersQuery())));

        group.MapPost("/", async (CreatePlayerCommand command, IMediator mediator) =>
        {
            try
            {
                var player = await mediator.Send(command);
                return Results.Created($"/api/players/{player.Id}", player);
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { error = ex.Message });
            }
        });

        group.MapPut("/{id:guid}/name", async (Guid id, UpdateNameRequest body, IMediator mediator) =>
        {
            try
            {
                var updated = await mediator.Send(new UpdatePlayerNameCommand(id, body.Name));
                return updated ? Results.NoContent() : Results.NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { error = ex.Message });
            }
        });

        group.MapPut("/{id:guid}/photo", async (Guid id, UpdatePhotoRequest body, IMediator mediator) =>
        {
            var updated = await mediator.Send(new UpdatePlayerPhotoCommand(id, body.PhotoUrl));
            return updated ? Results.NoContent() : Results.NotFound();
        });

        group.MapPut("/{id:guid}/rating", async (Guid id, UpdateRatingRequest body, IMediator mediator) =>
        {
            try
            {
                var updated = await mediator.Send(new UpdatePlayerRatingCommand(id, body.Rating));
                return updated ? Results.NoContent() : Results.NotFound();
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        group.MapPut("/{id:guid}/es-del-grupo", async (Guid id, UpdateEsDelGrupoRequest body, IMediator mediator) =>
        {
            var updated = await mediator.Send(new UpdatePlayerEsDelGrupoCommand(id, body.EsDelGrupo));
            return updated ? Results.NoContent() : Results.NotFound();
        });

        // NUEVO ENDPOINT DE MEDALLAS / LOGROS
        group.MapGet("/{id:guid}/badges", async (Guid id, IMediator mediator) =>
        {
            try
            {
                var badges = await mediator.Send(new GetPlayerBadgesQuery(id));
                return Results.Ok(badges);
            }
            catch (InvalidOperationException ex)
            {
                return Results.NotFound(new { error = ex.Message });
            }
        });

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var deleted = await mediator.Send(new DeletePlayerCommand(id));
            return deleted ? Results.NoContent() : Results.NotFound();
        });
    }
}