namespace Futbol5.Application.Common.DTOs;

public record PlayerDto(Guid Id, string Name, string? PhotoUrl, int? Rating, int Mmr, string Rank, bool EsDelGrupo);