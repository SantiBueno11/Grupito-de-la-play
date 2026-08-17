namespace Futbol5.Application.Common.DTOs;

public record MmrEntryDto(
    Guid PlayerId,
    string PlayerName,
    string? PhotoUrl,
    double Mmr,
    int GamesPlayed,
    int Wins,
    int Losses,
    int Draws
);