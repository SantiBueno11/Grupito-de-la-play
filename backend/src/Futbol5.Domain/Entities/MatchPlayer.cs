using Futbol5.Domain.Enums;

namespace Futbol5.Domain.Entities;

public class MatchPlayer
{
    public Guid MatchId { get; private set; }
    public Match? Match { get; private set; }

    public Guid PlayerId { get; private set; }
    public Player? Player { get; private set; }

    public Team Team { get; private set; }
    public bool HasSpecialTag { get; private set; }
    
    // NUEVO CAMPO:
    public bool Asistio { get; private set; }

    private MatchPlayer() { }

    // Actualizamos el constructor para recibir si asistió
    public MatchPlayer(Guid matchId, Guid playerId, Team team, bool hasSpecialTag, bool asistio)
    {
        MatchId = matchId;
        PlayerId = playerId;
        Team = team;
        HasSpecialTag = hasSpecialTag;
        Asistio = asistio;
    }
}