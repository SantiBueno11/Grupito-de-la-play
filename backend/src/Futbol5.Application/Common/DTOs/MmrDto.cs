namespace Futbol5.Application.Common.DTOs;

public record MmrEntryDto(
    Guid PlayerId,
    string PlayerName,
    string? PhotoUrl,
    int Rating,
    string Tier,
    int Played
);