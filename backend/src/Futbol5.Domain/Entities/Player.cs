namespace Futbol5.Domain.Entities;

public class Player
{
    public Guid Id { get; private set; }
    public int UserId { get; set; }
    public string Name { get; private set; } = string.Empty;
    public string? PhotoUrl { get; private set; }
    
    // El sistema de estrellas clásico para el randomizador (1 a 5)
    public int? Rating { get; private set; } 

    // Sistema de puntos competitivo (arrancan en 1000)
    public int Mmr { get; private set; } = 1000;

    // Si es parte del grupo fijo (los 10 de siempre) o un invitado/reemplazo
    // ocasional. Solo los del grupo entran en Clasificación y Asistencia.
    public bool EsDelGrupo { get; private set; } = true;

    // Rango dinámico basado en el MMR con los rangos clásicos
    public string Rank => Mmr switch
    {
        < 800  => "Bronce",
        < 1100 => "Plata",
        < 1400 => "Oro",
        < 1700 => "Platino",
        < 2000 => "Diamante",
        < 2300 => "Campeón",
        < 2600 => "Gran Campeón",
        _      => "Leyenda"
    };

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

    public void SetRating(int? rating)
    {
        if (rating is < 1 or > 5)
            throw new ArgumentException("El nivel tiene que ser entre 1 y 5.", nameof(rating));

        Rating = rating;
    }

    public void SetEsDelGrupo(bool esDelGrupo)
    {
        EsDelGrupo = esDelGrupo;
    }

    // Método para actualizar los puntos después de un partido
    public void UpdateMmr(int pointsToAdd)
    {
        Mmr += pointsToAdd;
        
        // Evitamos que los puntos bajen de cero
        if (Mmr < 0) Mmr = 0;
    }

    // Método para resetear el MMR al histórico base
    public void ResetMmr()
    {
        Mmr = 1000;
    }
}