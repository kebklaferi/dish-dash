using System.Net.Http.Json;

namespace DeliveryService.Client;

public class NotificationClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<NotificationClient> _logger;
    
    public NotificationClient(HttpClient httpClient, ILogger<NotificationClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }
    
    public async Task<bool> SendDeliveryNotificationAsync(string userId, string title, string message, string type = "delivery", string priority = "medium")
    {
        try
        {
            var notification = new
            {
                userId,
                type,
                title,
                message,
                priority,
                metadata = new
                {
                    source = "delivery-service",
                    timestamp = DateTime.UtcNow
                }
            };
            var response = await _httpClient.PostAsJsonAsync("/notifications/send", notification);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Notification sent successfully for user {UserId}", userId);
                return true;
            }
            
            _logger.LogWarning("Failed to send notification. Status: {StatusCode}", response.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for user {UserId}", userId);
            return false;
        }
    }
}