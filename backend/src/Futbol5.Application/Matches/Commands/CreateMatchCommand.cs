using Futbol5.Application.Common.DTOs;
using Futbol5.Application.Common.Interfaces;
using Futbol5.Application.Matches.Commands;
using Futbol5.Domain.Entities;
using Futbol5.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Matches.Commands;

public record CreateMatchPlayerInput(
    Guid PlayerId,
    bool HasSpecialTag,
    bool Asistio
);

public record CreateMatchAttendanceInput(
    Guid PlayerId,
    bool Asistio
);

public record CreateMatchCommand(
    DateOnly Date,
    string TeamAName,
    string TeamBName,
    int ScoreA,
    int ScoreB,
    List<CreateMatchPlayerInput> TeamA,
    List<CreateMatchPlayerInput> TeamB,
    List<CreateMatchAttendanceInput> Attendance
) : IRequest<Guid>;

public class CreateMatchCommandHandler(
    IApplicationDbContext context,
    IMediator mediator
) : IRequestHandler<CreateMatchCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateMatchCommand request,
        CancellationToken cancellationToken)
    {
        // ============================================================
        // 🚨 CÁMARA OCULTA: ¿Entra acá cuando guardás el partido?
        // ============================================================
        Console.WriteLine("\n⚽ [DEBUG] ¡ESTOY ENTRANDO A CREAR EL PARTIDO! ⚽\n");

        // ============================================================
        // 1. VALIDAR EQUIPOS
        // ============================================================

        if (request.TeamA.Count == 0 || request.TeamB.Count == 0)
        {
            throw new InvalidOperationException(
                "Los dos equipos necesitan al menos un jugador."
            );
        }

        // ============================================================
        // 2. OBTENER TODOS LOS IDS
        // ============================================================

        var allIds = request.TeamA
            .Select(p => p.PlayerId)
            .Concat(request.TeamB.Select(p => p.PlayerId))
            .Concat(request.Attendance.Select(p => p.PlayerId))
            .Distinct()
            .ToList();

        // ============================================================
        // 3. COMPROBAR QUE TODOS EXISTAN
        // ============================================================

        var jugadoresDb = await context.Players
            .Where(p => allIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        if (jugadoresDb.Count != allIds.Count)
        {
            throw new InvalidOperationException(
                "Alguno de los jugadores no existe."
            );
        }

        // ============================================================
        // 4. CREAR EL PARTIDO
        // ============================================================

        var match = new Match(
            request.Date,
            request.TeamAName,
            request.TeamBName,
            request.ScoreA,
            request.ScoreB
        );

        // ============================================================
        // DICCIONARIO DE ASISTENCIAS
        // ============================================================
        var diccionarioAsistencias = request.Attendance
            .ToDictionary(a => a.PlayerId, a => a.Asistio);

        // ============================================================
        // 5. AGREGAR JUGADORES DEL EQUIPO A
        // ============================================================

        foreach (var p in request.TeamA)
        {
            bool realmenteAsistio = diccionarioAsistencias.ContainsKey(p.PlayerId) 
                ? diccionarioAsistencias[p.PlayerId] 
                : p.Asistio;

            match.AddPlayer(
                p.PlayerId,
                Team.A,
                p.HasSpecialTag,
                realmenteAsistio
            );
        }

        // ============================================================
        // 6. AGREGAR JUGADORES DEL EQUIPO B
        // ============================================================

        foreach (var p in request.TeamB)
        {
            bool realmenteAsistio = diccionarioAsistencias.ContainsKey(p.PlayerId) 
                ? diccionarioAsistencias[p.PlayerId] 
                : p.Asistio;

            match.AddPlayer(
                p.PlayerId,
                Team.B,
                p.HasSpecialTag,
                realmenteAsistio
            );
        }

        // ============================================================
        // 7. AGREGAR LOS QUE FALTARON Y NO ESTABAN EN NINGÚN EQUIPO
        // ============================================================

        var jugadoresEnEquipos = request.TeamA
            .Select(p => p.PlayerId)
            .Concat(request.TeamB.Select(p => p.PlayerId))
            .ToHashSet();

        foreach (var asistencia in request.Attendance)
        {
            if (jugadoresEnEquipos.Contains(asistencia.PlayerId))
                continue;

            if (!asistencia.Asistio)
            {
                match.AddPlayer(
                    asistencia.PlayerId,
                    Team.A,
                    false,
                    false
                );
            }
        }

        // ============================================================
        // 8. GUARDAR PARTIDO Y DISPARAR EL RECÁLCULO AUTOMÁTICO
        // ============================================================

        context.Matches.Add(match);

        await context.SaveChangesAsync(cancellationToken);

        // Esto ejecuta el recálculo de MMR y aplica los -50 a los ausentes
        await mediator.Send(new RecalculateMmrCommand(), cancellationToken);

        return match.Id;
    }
}