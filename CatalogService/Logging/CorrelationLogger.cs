using CatalogService.RabbitMQ;

namespace CatalogService.Logging;

public class CorrelationLogger
{
    private readonly ILogger<CorrelationLogger> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly RabbitMqService _rabbitMq;

    public CorrelationLogger(ILogger<CorrelationLogger> logger, IHttpContextAccessor httpContextAccessor, RabbitMqService rabbitMq)
    {
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _rabbitMq = rabbitMq;
    }

    private string GetCorrelationId()
    {
        return _httpContextAccessor.HttpContext?.Items["CorrelationId"]?.ToString() 
               ?? Guid.NewGuid().ToString();
    }

    public void LogInfo(string message, object? data = null)
    {
        var correlationId = GetCorrelationId();
        var url = _httpContextAccessor.HttpContext?.Request.Path ?? "N/A";
        
        var logMessage = $"{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss,fff} INFO {url} Correlation: {correlationId} [CatalogService] - {message}";
        
        _logger.LogInformation(logMessage);
        _rabbitMq.PublishLog("info", message, correlationId, data);
    }

    public void LogError(string message, Exception? ex = null, object? data = null)
    {
        var correlationId = GetCorrelationId();
        var url = _httpContextAccessor.HttpContext?.Request.Path ?? "N/A";
        
        var logMessage = $"{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss,fff} ERROR {url} Correlation: {correlationId} [CatalogService] - {message}";
        
        _logger.LogError(ex, logMessage);
        _rabbitMq.PublishLog("error", message, correlationId, new { error = ex?.Message, stackTrace = ex?.StackTrace, data });
    }
    
    public void LogWarning(string message, object? data = null)
    {
        var correlationId = GetCorrelationId();
        var url = _httpContextAccessor.HttpContext?.Request.Path ?? "N/A";

        var logMessage = $"{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss,fff} WARN {url} Correlation: {correlationId} [CatalogService] - {message}";
        
        _logger.LogWarning(logMessage);
        _rabbitMq.PublishLog("warn", message, correlationId, data);
    }
}