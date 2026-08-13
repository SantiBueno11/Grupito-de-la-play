namespace Futbol5.Domain.Entities;

public class Player
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? PhotoUrl { get; private set; }

    private readonly List<MatchPlayer> _matchPlayers = new();
    public IReadOnlyCollection<MatchPlayer> MatchPlayers => _matchPlayers.AsReadOnly();

    private Player() { }

    public Player(string name, string? photoUrl = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("El nombre del jugador no puede estar vacío.", nameof(name));

        Id = Guid.NewGuid();
        Name = name.Trim();
        PhotoUrl = photoUrl;
    }

    public void Rename(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("El nombre del jugador no puede estar vacío.", nameof(name));

        Name = name.Trim();
    }

    public void SetPhoto(string? photoUrl)
    {
        PhotoUrl = photoUrl;
    }
}
