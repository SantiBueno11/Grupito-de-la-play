using Futbol5.Domain.Enums;

namespace Futbol5.Domain.Entities;

public class Match
{
    public Guid Id { get; private set; }
    public DateOnly Date { get; private set; }
    public string TeamAName { get; private set; } = "Equipo A";
    public string TeamBName { get; private set; } = "Equipo B";
    public int ScoreA { get; private set; }
    public int ScoreB { get; private set; }

    private readonly List<MatchPlayer> _matchPlayers = new();
    public IReadOnlyCollection<MatchPlayer> MatchPlayers => _matchPlayers.AsReadOnly();

    public bool TeamAWon => ScoreA > ScoreB;
    public bool TeamBWon => ScoreB > ScoreA;

    private Match() { }

    public Match(DateOnly date, string teamAName, string teamBName, int scoreA, int scoreB)
    {
        if (scoreA < 0 || scoreB < 0)
            throw new ArgumentException("El resultado no puede ser negativo.");

        Id = Guid.NewGuid();
        Date = date;
        TeamAName = string.IsNullOrWhiteSpace(teamAName) ? "Equipo A" : teamAName.Trim();
        TeamBName = string.IsNullOrWhiteSpace(teamBName) ? "Equipo B" : teamBName.Trim();
        ScoreA = scoreA;
        ScoreB = scoreB;
    }

    public void AddPlayer(Guid playerId, Team team, bool hasSpecialTag = false, bool asistio = true)
    {
        if (_matchPlayers.Any(mp => mp.PlayerId == playerId))
            throw new InvalidOperationException("El jugador ya está cargado en este partido.");

        // Pasamos el parámetro asistio al constructor de MatchPlayer
        _matchPlayers.Add(new MatchPlayer(Id, playerId, team, hasSpecialTag, asistio));
    }
}