namespace Futbol5.Application.Common.DTOs;

public record MatchPlayerDto(Guid PlayerId, string PlayerName, string? PhotoUrl, bool HasSpecialTag);

public record MatchDto(
    Guid Id,
    DateOnly Date,
    string TeamAName,
    string TeamBName,
    int ScoreA,
    int ScoreB,
    List<MatchPlayerDto> TeamA,
    List<MatchPlayerDto> TeamB,
    List<MatchPlayerDto> Ausentes
);