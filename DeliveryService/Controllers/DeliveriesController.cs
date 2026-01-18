using DeliveryService.Generated;
using DeliveryService.Logging;
using DeliveryService.RabbitMQ;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DeliveryService.Models;

namespace DeliveryService.Controllers;

[ApiController]
[Route("api/delivery")]
[Authorize]
public class DeliveriesController : ControllerBase
{
    private readonly DeliveryDbContext _context;
    private readonly ILogger<DeliveriesController> _logger;
    private readonly OrderServiceClient _orderServiceClient;
    private readonly CorrelationLogger _correlationLogger;
    private readonly RabbitMqService _rabbitMq;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public DeliveriesController(
        DeliveryDbContext context, 
        ILogger<DeliveriesController> logger, 
        OrderServiceClient orderServiceClient,
        CorrelationLogger correlationLogger,
        RabbitMqService rabbitMq,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _logger = logger;
        _orderServiceClient = orderServiceClient;
        _correlationLogger = correlationLogger;
        _rabbitMq = rabbitMq;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetCorrelationId() 
        => _httpContextAccessor.HttpContext?.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();
    
    [HttpPost("driver")]
    public async Task<IActionResult> AddDriver([FromBody] Models.DriverDto driverDto)
    {
        try
        {
            _correlationLogger.LogInfo($"Adding new driver: {driverDto.name}");

            var driver = new Models.Driver
            {
                name = driverDto.name,
                occupied = false
            };
            
            _context.Drivers.Add(driver);
            await _context.SaveChangesAsync();

            _rabbitMq.PublishEvent("delivery.driver.created", new { driver.id, driver.name }, GetCorrelationId());
            _correlationLogger.LogInfo($"Driver {driver.id} created successfully");

            return CreatedAtAction(nameof(GetDriverStatus), new { driverId = driver.id }, driver);
        }
        catch (Exception ex)
        {
            _correlationLogger.LogError($"Error adding driver: {driverDto.name}", ex);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("assign")]
    [Authorize]
    public async Task<IActionResult> AssignDelivery([FromBody] Models.AssignDelivery assignDelivery)
    {
        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("User ID not found in token. Available claims: {Claims}", 
                    string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));
                return Unauthorized("User ID not found in token");
            }

            var userName = User.FindFirst("name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
            _logger.LogInformation("User {UserName} (ID: {UserId}) is assigning delivery for order {OrderId}", 
                userName, userId, assignDelivery.order_id);
            
            var order = await _orderServiceClient.OrdersGETAsync(Guid.Parse(assignDelivery.order_id));
            if (order == null)
            {
                _logger.LogWarning("Order {OrderId} not found", assignDelivery.order_id);
                return NotFound($"Order {assignDelivery.order_id} not found");
            }
            
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => !d.occupied);
            if (driver == null)
            {
                _logger.LogWarning("No available drivers for order {OrderId}", assignDelivery.order_id);
                return NotFound("No available drivers");
            }
            
            var delivery = new Models.Delivery
            {
                order_id = assignDelivery.order_id,
                addres = assignDelivery.address,
                delivery_date = DateTime.UtcNow.AddHours(2),
                status = "Assigned",
                driver_id = driver.id
            };

            driver.occupied = true;
            _context.Deliveries.Add(delivery);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Delivery {DeliveryId} assigned to driver {DriverId} for order {OrderId}", 
                delivery.id, driver.id, assignDelivery.order_id);

            return Ok(new 
            { 
                message = "Delivery assigned successfully",
                delivery = new
                {
                    id = delivery.id,
                    order_id = delivery.order_id,
                    address = delivery.addres,
                    delivery_date = delivery.delivery_date,
                    status = delivery.status,
                    driver = new
                    {
                        id = driver.id,
                        name = driver.name
                    }
                }
            });
        }
        catch (FormatException ex)
        {
            _logger.LogError(ex, "Invalid order ID format: {OrderId}", assignDelivery.order_id);
            return BadRequest("Invalid order ID format");
        }
        catch (ApiException ex)
        {
            _logger.LogError(ex, "Failed to fetch order {OrderId} from OrderService. Status: {StatusCode}", 
                assignDelivery.order_id, ex.StatusCode);
            
            if (ex.StatusCode == 401)
            {
                return Unauthorized("Not authorized to access this order");
            }
            else if (ex.StatusCode == 404)
            {
                return NotFound($"Order {assignDelivery.order_id} not found");
            }
            
            return StatusCode(500, "Failed to verify order with OrderService");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while assigning delivery for order {OrderId}", assignDelivery.order_id);
            return StatusCode(500, "An unexpected error occurred while assigning delivery");
        }
    }

    [HttpPost("{id}/status")]
    public async Task<IActionResult> UpdateDeliveryStatus(int id, [FromBody] string status)
    {
        try
        {
            _correlationLogger.LogInfo($"Updating delivery {id} status to {status}");

            var delivery = await _context.Deliveries.FindAsync(id);
            if (delivery == null)
            {
                _correlationLogger.LogWarning($"Delivery {id} not found");
                return NotFound("Delivery not found");
            }

            delivery.status = status;
            await _context.SaveChangesAsync();
            
            // Update order status in OrderService if delivered
            if (status == "Delivered")
            {
                try
                {
                    await _orderServiceClient.StatusAsync(Guid.Parse(delivery.order_id), new Body2{ Status = Body2Status.Delivered});
                    _correlationLogger.LogInfo($"Order {delivery.order_id} status updated to Delivered");
                }
                catch (Exception ex)
                {
                    _correlationLogger.LogError($"Failed to update order {delivery.order_id} status", ex);
                }
            }
            
            var notificationMessage = status switch
            {
                "Picked Up" => "Your order has been picked up and is on its way!",
                "In Transit" => "Your delivery is in transit.",
                "Delivered" => "Your order has been delivered! Enjoy your meal!",
                "Cancelled" => "Your delivery has been cancelled.",
                _ => $"Delivery status updated to: {status}"
            };

            _rabbitMq.PublishEvent("delivery.status.updated", new 
            { 
                deliveryId = id, 
                orderId = delivery.order_id,
                status, 
                notificationMessage 
            }, GetCorrelationId());

            _correlationLogger.LogInfo($"Delivery {id} status updated to {status}");
            
            return Ok(delivery);
        }
        catch (Exception ex)
        {
            _correlationLogger.LogError($"Error updating delivery {id} status", ex);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDelivery(int id)
    {
        try
        {
            _correlationLogger.LogInfo($"Fetching delivery {id}");

            var delivery = await _context.Deliveries.FindAsync(id);
            if (delivery == null)
            {
                _correlationLogger.LogWarning($"Delivery {id} not found");
                return NotFound();
            }

            _correlationLogger.LogInfo($"Retrieved delivery {id}");
            return Ok(delivery);
        }
        catch (Exception ex)
        {
            _correlationLogger.LogError($"Error fetching delivery {id}", ex);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("driver/{driverId}/status")]
    public async Task<IActionResult> GetDriverStatus(int driverId)
    {
        try
        {
            _correlationLogger.LogInfo($"Fetching driver {driverId} status");

            var driver = await _context.Drivers.FindAsync(driverId);
            if (driver == null)
            {
                _correlationLogger.LogWarning($"Driver {driverId} not found");
                return NotFound("Driver not found");
            }

            _correlationLogger.LogInfo($"Retrieved driver {driverId} status: occupied={driver.occupied}");
            return Ok(new { Id = driver.id, Name = driver.name, Occupied = driver.occupied });
        }
        catch (Exception ex)
        {
            _correlationLogger.LogError($"Error fetching driver {driverId} status", ex);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDelivery(int id, [FromBody] Models.DeliveryDto updatedDeliveryDto)
    {
        try
        {
            _correlationLogger.LogInfo($"Updating delivery {id}", updatedDeliveryDto);

            var updatedDelivery = await _context.Deliveries.FindAsync(id);
            if (updatedDelivery == null)
            {
                _correlationLogger.LogWarning($"Delivery {id} not found");
                return NotFound("Delivery not found");
            }

            updatedDelivery.addres = updatedDeliveryDto.addres;
            updatedDelivery.delivery_date = updatedDeliveryDto.delivery_date;
            updatedDelivery.status = updatedDeliveryDto.status;
            updatedDelivery.driver_id = updatedDeliveryDto.driver_id;

            await _context.SaveChangesAsync();

            _rabbitMq.PublishEvent("delivery.updated", new { deliveryId = id }, GetCorrelationId());
            _correlationLogger.LogInfo($"Delivery {id} updated successfully");

            return Ok(updatedDelivery);
        }
        catch (Exception ex)
        {
            _correlationLogger.LogError($"Error updating delivery {id}", ex, updatedDeliveryDto);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("driver/{driverId}")]
    public async Task<IActionResult> UpdateDriverStatus(int driverId, [FromBody] bool occupied)
    {
        try
        {
            _correlationLogger.LogInfo($"Updating driver {driverId} occupied status to {occupied}");

            var driver = await _context.Drivers.FindAsync(driverId);
            if (driver == null)
            {
                _correlationLogger.LogWarning($"Driver {driverId} not found");
                return NotFound("Driver not found");
            }

            driver.occupied = occupied;
            await _context.SaveChangesAsync();

            _rabbitMq.PublishEvent("delivery.driver.status.updated", new { driverId, occupied }, GetCorrelationId());
            _correlationLogger.LogInfo($"Driver {driverId} status updated to occupied={occupied}");

            return Ok(driver);
        }
        catch (Exception ex)
        {
            _correlationLogger.LogError($"Error updating driver {driverId} status", ex);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDelivery(int id)
    {
        try
        {
            _correlationLogger.LogInfo($"Deleting delivery {id}");

            var delivery = await _context.Deliveries.FindAsync(id);
            if (delivery == null)
            {
                _correlationLogger.LogWarning($"Delivery {id} not found");
                return NotFound("Delivery not found");
            }

            _context.Deliveries.Remove(delivery);
            await _context.SaveChangesAsync();

            _rabbitMq.PublishEvent("delivery.deleted", new { deliveryId = id, orderId = delivery.order_id }, GetCorrelationId());
            _correlationLogger.LogInfo($"Delivery {id} deleted successfully");

            return NoContent();
        }
        catch (Exception ex)
        {
            _correlationLogger.LogError($"Error deleting delivery {id}", ex);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("driver/{driverId}")]
    public async Task<IActionResult> DeleteDriver(int driverId)
    {
        try
        {
            _correlationLogger.LogInfo($"Deleting driver {driverId}");

            var driver = await _context.Drivers.FindAsync(driverId);
            if (driver == null)
            {
                _correlationLogger.LogWarning($"Driver {driverId} not found");
                return NotFound("Driver not found");
            }

            _context.Drivers.Remove(driver);
            await _context.SaveChangesAsync();

            _rabbitMq.PublishEvent("delivery.driver.deleted", new { driverId, driverName = driver.name }, GetCorrelationId());
            _correlationLogger.LogInfo($"Driver {driverId} deleted successfully");

            return NoContent();
        }
        catch (Exception ex)
        {
            _correlationLogger.LogError($"Error deleting driver {driverId}", ex);
            return StatusCode(500, "Internal server error");
        }
    }
}