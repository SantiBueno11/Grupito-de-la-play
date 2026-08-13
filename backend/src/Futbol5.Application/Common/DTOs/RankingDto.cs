namespace Futbol5.Application.Common.DTOs;

public record RankingEntryDto(
    Guid PlayerId,
    string PlayerName,
    string? PhotoUrl,
    int Played,
    int Wins,
    int Losses,
    double WinRate,
    int SpecialTagCount,
    int CurrentStreak // positivo = racha de victorias, negativo = racha de derrotas, 0 = sin racha
);
