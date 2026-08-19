namespace Futbol5.Application.Common.DTOs;

public record MmrEntryDto(
    Guid PlayerId,
    string PlayerName,
    string? PhotoUrl,
    string Rank,
    int Mmr,
    int GamesPlayed
);