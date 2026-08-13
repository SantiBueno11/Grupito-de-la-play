namespace Futbol5.Application.Common.DTOs;

public record HeadToHeadDto(
    Guid PlayerAId,
    string PlayerAName,
    string? PlayerAPhotoUrl,
    Guid PlayerBId,
    string PlayerBName,
    string? PlayerBPhotoUrl,
    int MatchesAsRivals,   // veces que jugaron en equipos contrarios
    int WinsA,
    int WinsB,
    int Ties,
    int MatchesAsTeammates, // veces que jugaron en el mismo equipo
    int WinsTogether,
    int LossesTogether
);
