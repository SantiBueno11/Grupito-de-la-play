using Futbol5.Application.Matches.Queries;
using Futbol5.Application.Players.Queries;
using Futbol5.Domain.Entities;
using Futbol5.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Api.Endpoints;

public static class DashboardEndpoints
{
    public static void MapDashboardEndpoints(this WebApplication app)
    {
        app.MapGet("/api/dashboard", async (IMediator mediator, Futbol5DbContext db) =>
        {
            var players = await mediator.Send(new GetPlayersQuery());
            var matches = await mediator.Send(new GetMatchesQuery());
            var ranking = await mediator.Send(new GetRankingQuery());
            var attendance = await mediator.Send(new GetAttendanceQuery());
            var mmr = await mediator.Send(new GetMmrQuery());

            var settings = await db.Set<GroupSettingsEntity>().FirstOrDefaultAsync(s => s.Id == 1);
            if (settings == null)
            {
                settings = new GroupSettingsEntity();
                db.Set<GroupSettingsEntity>().Add(settings);
                await db.SaveChangesAsync();
            }

            return Results.Ok(new
            {
                players,
                matches,
                ranking,
                attendance,
                mmr,
                settings
            });
        }).WithTags("Dashboard");
    }
}