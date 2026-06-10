using System.Security.Claims;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.API.Providers;

public class CurrentUserContext : ICurrentUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? UserId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var val = user?.FindFirst("sub")?.Value ?? user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(val, out var id) ? id : null;
        }
    }

    public string? Role
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            return user?.FindFirst("role")?.Value ?? user?.FindFirst(ClaimTypes.Role)?.Value;
        }
    }

    public bool IsSystem => _httpContextAccessor.HttpContext == null;
}
