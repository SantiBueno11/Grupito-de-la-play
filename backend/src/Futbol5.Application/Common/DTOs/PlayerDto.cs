namespace Futbol5.Application.Common.DTOs;

// Sumamos el Mmr y el Rank al final para que viajen al frontend
public record PlayerDto(Guid Id, string Name, string? PhotoUrl, int? Rating, int Mmr, string Rank);