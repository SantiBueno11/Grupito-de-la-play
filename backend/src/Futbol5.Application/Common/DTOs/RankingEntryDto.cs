namespace Futbol5.Application.Common.DTOs;

public record RankingEntryDto(
    Guid PlayerId,
    string Name,
    string? PhotoUrl,
    int Played,
    int Wins,
    int Losses,
    double WinRate,
    int Tags,
    int Streak,
    int Mmr,
    string Rank
);