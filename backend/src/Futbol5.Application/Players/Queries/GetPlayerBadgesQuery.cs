using Futbol5.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Futbol5.Application.Players.Queries;

public record BadgeDto(string Id, string Title, string Description, string Icon, bool Unlocked);

public record GetPlayerBadgesQuery(Guid PlayerId) : IRequest<List<BadgeDto>>;

public class GetPlayerBadgesQueryHandler(IApplicationDbContext context) 
    : IRequestHandler<GetPlayerBadgesQuery, List<BadgeDto>>
{
    public async Task<List<BadgeDto>> Handle(GetPlayerBadgesQuery request, CancellationToken cancellationToken)
    {
        var player = await context.Players
            .Include(p => p.MatchPlayers)
                .ThenInclude(mp => mp.Match)
            .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken);

        if (player == null) throw new InvalidOperationException("Jugador no encontrado.");

        // Ordenar partidos cronológicamente (del más antiguo al más reciente) 
        // para evaluar bien la secuencia de la racha.
        var matchesPlayed = player.MatchPlayers
            .Where(mp => mp.Match != null)
            .OrderBy(mp => mp.Match.Date)
            .ToList();

        var totalMatches = matchesPlayed.Count;

        // Calcular MMR ranking (Rey de la selva)
        var topPlayerId = await context.Players
            .OrderByDescending(p => p.Mmr)
            .Select(p => p.Id)
            .FirstOrDefaultAsync(cancellationToken);

        bool isKing = topPlayerId == player.Id;

        int maxWinStreak = 0;
        int currentWinStreak = 0;
        int currentLossStreak = 0;
        bool hasCleanSheetWin = false;
        bool hasCrushingWin = false;

        foreach (var mp in matchesPlayed)
        {
            var match = mp.Match;
            if (match == null) continue;

            bool isTeamA = mp.Team.ToString() == "A"; 
            int playerScore = isTeamA ? match.ScoreA : match.ScoreB;
            int rivalScore = isTeamA ? match.ScoreB : match.ScoreA;

            bool won = playerScore > rivalScore;
            bool lost = playerScore < rivalScore;

            if (won)
            {
                currentWinStreak++;
                if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;

                if (rivalScore == 0) hasCleanSheetWin = true;
                if ((playerScore - rivalScore) >= 4) hasCrushingWin = true;
                
                currentLossStreak = 0;
            }
            else if (lost)
            {
                currentLossStreak++;
                currentWinStreak = 0;
            }
            else
            {
                currentWinStreak = 0;
                currentLossStreak = 0;
            }
        }

        var badges = new List<BadgeDto>
        {
            new("racha_fuego", "Racha de Fuego", "Ganar 3 partidos consecutivos", "🔥", maxWinStreak >= 3),
            new("veterano", "Veterano", "Alcanzar los 20 partidos jugados", "🪖", totalMatches >= 20),
            new("rey_selva", "Rey de la Selva", "Llegar al puesto #1 del ranking de MMR", "🦁", isKing),
            new("muro", "El Muro", "Ganar un partido manteniendo la valla invicta", "🧱", hasCleanSheetWin),
            new("aplastante", "Aplastante", "Ganar un partido por 4+ goles de diferencia", "💥", hasCrushingWin),
            new("en_lona", "En la Lona", "Perder 3 partidos seguidos", "📉", currentLossStreak >= 3)
        };

        return badges;
    }
}