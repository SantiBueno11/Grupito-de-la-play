using Futbol5.Application.Common.Interfaces;
using Futbol5.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Futbol5.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? Username => _httpContextAccessor.HttpContext?.Request.Headers["X-Username"].FirstOrDefault();

    public int? UserId
    {
        get
        {
            var headerValue = _httpContextAccessor.HttpContext?.Request.Headers["X-User-Id"].FirstOrDefault();
            if (int.TryParse(headerValue, out var id))
            {
                return id;
            }
            return null;
        }
    }
}
