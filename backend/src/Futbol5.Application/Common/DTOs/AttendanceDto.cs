namespace Futbol5.Application.Common.DTOs;

public record AttendanceEntryDto(
    Guid PlayerId,
    string PlayerName,
    string? PhotoUrl,
    int GamesPlayed,
    int TotalMatches,
    int GamesMissed,
    double AttendanceRate
);
