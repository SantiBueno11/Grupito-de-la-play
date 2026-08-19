using Futbol5.Application.Matches.Commands;
using Futbol5.Application.Matches.Queries;
using MediatR;

namespace Futbol5.Api.Endpoints;

public static class MatchesEndpoints
{
    public static void MapMatchesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/matches").WithTags("Matches");

        group.MapGet("/", async (IMediator mediator) =>
            Results.Ok(await mediator.Send(new GetMatchesQuery())));

        group.MapGet("/ranking", async (IMediator mediator) =>
            Results.Ok(await mediator.Send(new GetRankingQuery())));

        group.MapGet("/attendance", async (IMediator mediator) =>
            Results.Ok(await mediator.Send(new GetAttendanceQuery())));

        group.MapGet("/mmr", async (IMediator mediator) =>
            Results.Ok(await mediator.Send(new GetMmrQuery())));

        group.MapGet("/head-to-head/{playerAId:guid}/{playerBId:guid}", async (Guid playerAId, Guid playerBId, IMediator mediator) =>
        {
            try
            {
                return Results.Ok(await mediator.Send(new GetHeadToHeadQuery(playerAId, playerBId)));
            }
            catch (InvalidOperationException ex)
            {
                return Results.NotFound(new { error = ex.Message });
            }
        });

        group.MapPost("/", async (CreateMatchCommand command, IMediator mediator) =>
        {
            try
            {
                // 1. Guardamos el partido
                var id = await mediator.Send(command);
                
                // 2. Recalculamos el MMR de todos automáticamente tras cada partido
                await mediator.Send(new RecalculateMmrCommand());

                return Results.Created($"/api/matches/{id}", new { id });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var deleted = await mediator.Send(new DeleteMatchCommand(id));
            
            // Recalculamos el MMR también si se elimina un partido
            if (deleted) await mediator.Send(new RecalculateMmrCommand());
            
            return deleted ? Results.NoContent() : Results.NotFound();
        });
    }
}