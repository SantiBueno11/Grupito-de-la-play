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

        var matchesPlayed = player.MatchPlayers?
            .Where(mp => mp != null && mp.Match != null)
            .OrderBy(mp => mp.Match!.Date)
            .ToList() ?? new();

        var totalMatches = matchesPlayed.Count;

        var allMatches = await context.Matches
            .OrderBy(m => m.Date)
            .ToListAsync(cancellationToken);

        var playerMatchIds = new HashSet<Guid>(matchesPlayed.Select(mp => mp.MatchId));

        int maxAttendanceStreak = 0;
        int currentAttendanceStreak = 0;
        int maxAbsenceStreak = 0;
        int currentAbsenceStreak = 0;
        bool hasStartedPlaying = false;

        foreach (var m in allMatches)
        {
            bool attended = playerMatchIds.Contains(m.Id);
            if (attended)
            {
                hasStartedPlaying = true;
                currentAttendanceStreak++;
                if (currentAttendanceStreak > maxAttendanceStreak) maxAttendanceStreak = currentAttendanceStreak;
                currentAbsenceStreak = 0;
            }
            else
            {
                if (hasStartedPlaying)
                {
                    currentAbsenceStreak++;
                    if (currentAbsenceStreak > maxAbsenceStreak) maxAbsenceStreak = currentAbsenceStreak;
                }
                currentAttendanceStreak = 0;
            }
        }

        int maxWinStreak = 0;
        int currentWinStreak = 0;
        int maxLossStreak = 0;
        int currentLossStreak = 0;
        bool hasCleanSheetWin = false;
        bool hasCrushingWin = false;

        var monthlyMatchesCount = new Dictionary<(int Year, int Month), int>();
        var monthlyLossesCount = new Dictionary<(int Year, int Month), int>();

        foreach (var mp in matchesPlayed)
        {
            var match = mp.Match;
            if (match == null) continue;

            string teamStr = mp.Team.ToString();
            bool isTeamA = teamStr.Equals("A", StringComparison.OrdinalIgnoreCase);

            int playerScore = isTeamA ? match.ScoreA : match.ScoreB;
            int rivalScore = isTeamA ? match.ScoreB : match.ScoreA;

            bool won = playerScore > rivalScore;
            bool lost = playerScore < rivalScore;

            var monthKey = (match.Date.Year, match.Date.Month);
            if (!monthlyMatchesCount.ContainsKey(monthKey))
            {
                monthlyMatchesCount[monthKey] = 0;
                monthlyLossesCount[monthKey] = 0;
            }
            monthlyMatchesCount[monthKey]++;
            if (lost)
            {
                monthlyLossesCount[monthKey]++;
            }

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
                if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
                currentWinStreak = 0;
            }
            else
            {
                currentWinStreak = 0;
                currentLossStreak = 0;
            }
        }

        bool hasUndefeatedMonth = false;
        foreach (var kvp in monthlyMatchesCount)
        {
            var key = kvp.Key;
            if (monthlyMatchesCount[key] > 0 && monthlyLossesCount[key] == 0)
            {
                hasUndefeatedMonth = true;
                break;
            }
        }

        var badges = new List<BadgeDto>
        {
            new("el_fiel", "El Fiel", "Asistir a 5 partidos seguidos sin faltar", "⏰", maxAttendanceStreak >= 5),
            new("racha_fuego", "Racha de Fuego", "Ganar 3 partidos consecutivos", "🔥", maxWinStreak >= 3),
            new("el_fantasma", "El Fantasma", "Faltar a 3 convocatorias al hilo", "👻", maxAbsenceStreak >= 3),
            new("muro", "El Muro", "Ganar un partido manteniendo la valla invicta", "🧱", hasCleanSheetWin),
            new("en_lona", "En la Lona", "Perder 3 partidos seguidos", "📉", maxLossStreak >= 3),
            new("veterano", "Veterano", "Alcanzar los 20 partidos jugados", "🪖", totalMatches >= 20),
            new("aplastante", "Aplastante", "Ganar un partido por goleada (4+ goles de diferencia)", "💥", hasCrushingWin),
            new("invicto_mes", "Invicto del Mes", "No perder ningún partido durante todo un mes", "🛡️", hasUndefeatedMonth)
        };

        return badges;
    }
}