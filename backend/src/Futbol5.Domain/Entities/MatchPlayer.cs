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

    private MatchPlayer() { }

    public MatchPlayer(Guid matchId, Guid playerId, Team team, bool hasSpecialTag)
    {
        MatchId = matchId;
        PlayerId = playerId;
        Team = team;
        HasSpecialTag = hasSpecialTag;
    }
}
