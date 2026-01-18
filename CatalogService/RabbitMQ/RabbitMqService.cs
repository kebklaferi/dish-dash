using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace CatalogService.RabbitMQ;

public class RabbitMqService : IDisposable
{
    private readonly ILogger<RabbitMqService> _logger;
    private readonly IConnection _connection;
    private readonly IChannel _channel;

    public RabbitMqService(IConfiguration configuration, ILogger<RabbitMqService> logger)
    {
        _logger = logger;

        var factory = new ConnectionFactory()
        {
            HostName = configuration["RabbitMQ:Host"] ?? "rabbitmq",
            Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672"),
            UserName = configuration["RabbitMQ:UserName"] ?? "admin",
            Password = configuration["RabbitMQ:Password"] ?? "admin123"
        };

        _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _channel = _connection.CreateChannelAsync().GetAwaiter().GetResult();
        
        _channel.ExchangeDeclareAsync(exchange: "catalog_exchange", type: ExchangeType.Topic, durable: true).GetAwaiter().GetResult();
        
        _channel.QueueDeclareAsync(queue: "catalog.logs", durable: true, exclusive: false, autoDelete: false).GetAwaiter().GetResult();
    }

    public void PublishEvent(string eventType, object eventData, string correlationId)
    {
        var message = JsonSerializer.Serialize(new
        {
            EventType = eventType,
            Timestamp = DateTime.UtcNow,
            CorrelationId = correlationId,
            Data = eventData
        });

        var body = Encoding.UTF8.GetBytes(message);
        
        var properties = new BasicProperties
        {
            CorrelationId = correlationId
        };
        
        _channel.BasicPublishAsync(exchange: "catalog_exchange",
            routingKey: eventType,
            mandatory: false,
            basicProperties: properties,
            body: body).GetAwaiter().GetResult();

        _logger.LogInformation($"Published event: {eventType} CorrelationId: {correlationId}");
    }

    public void PublishLog(string level, string message, string correlationId, object? data = null)
    {
        var logMessage = JsonSerializer.Serialize(new
        {
            service = "CatalogService",
            level,
            message,
            timestamp = DateTime.UtcNow,
            correlationId,
            data
        });

        var body = Encoding.UTF8.GetBytes(logMessage);
        
        var properties = new BasicProperties
        {
            CorrelationId = correlationId,
            Persistent = true
        };
        
        _channel.BasicPublishAsync(
            exchange: "", 
            routingKey: $"catalog.logs", 
            mandatory: false,
            basicProperties: properties,
            body: body).GetAwaiter().GetResult();
    }

    public void Dispose()
    {
        _channel?.CloseAsync().GetAwaiter().GetResult();
        _connection?.CloseAsync().GetAwaiter().GetResult();
    }
}