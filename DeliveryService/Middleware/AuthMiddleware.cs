namespace DeliveryService.Middleware;

public class AuthMiddleware
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<AuthMiddleware> _logger;

    public AuthMiddleware(IHttpContextAccessor httpContextAccessor, ILogger<AuthMiddleware> logger)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public string GetBearerToken()
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;
            
            if (httpContext == null)
            {
                _logger.LogWarning("HttpContext is null, cannot retrieve bearer token");
                return string.Empty;
            }

            var authHeader = httpContext.Request.Headers["Authorization"].FirstOrDefault();
            
            if (string.IsNullOrWhiteSpace(authHeader))
            {
                _logger.LogWarning("Authorization header is missing or empty");
                return string.Empty;
            }

            if (!authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Authorization header does not contain Bearer token");
                return string.Empty;
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            
            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Bearer token is empty after extraction");
                return string.Empty;
            }

            _logger.LogDebug("Successfully extracted bearer token");
            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while extracting bearer token");
            return string.Empty;
        }
    }

    public bool HasValidToken()
    {
        var token = GetBearerToken();
        return !string.IsNullOrWhiteSpace(token);
    }
}