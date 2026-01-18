using DeliveryService.Generated;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DeliveryService.Controllers;

[ApiController]
[Route("api/delivery")]
[Authorize]
public class DeliveriesController : ControllerBase
{
    private readonly DeliveryDbContext _context;
    private readonly ILogger<DeliveriesController> _logger;
    private readonly OrderServiceClient _orderServiceClient;

    public DeliveriesController(
        DeliveryDbContext context, 
        ILogger<DeliveriesController> logger, 
        OrderServiceClient orderServiceClient)
    {
        _context = context;
        _logger = logger;
        _orderServiceClient = orderServiceClient;
    }
    
    [HttpPost("driver")]
    public async Task<IActionResult> AddDriver([FromBody] Models.Driver driver)
    {
        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetDriverStatus), new { driverId = driver.id }, driver);
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
        var delivery = await _context.Deliveries.FindAsync(id);
        if (delivery == null)
        {
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
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update order {OrderId} status", delivery.order_id);
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
        
        return Ok(delivery);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDelivery(int id)
    {
        var delivery = await _context.Deliveries.FindAsync(id);
        if (delivery == null)
        {
            return NotFound();
        }

        return Ok(delivery);
    }

    [HttpGet("driver/{driverId}/status")]
    public async Task<IActionResult> GetDriverStatus(int driverId)
    {
        var driver = await _context.Drivers.FindAsync(driverId);
        if (driver == null)
        {
            return NotFound("Driver not found");
        }

        return Ok(new { Id = driver.id, Name = driver.name, Occupied = driver.occupied });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDelivery(int id, [FromBody] Models.Delivery updatedDelivery)
    {
        if (id != updatedDelivery.id)
        {
            return BadRequest("Delivery ID mismatch");
        }

        var delivery = await _context.Deliveries.FindAsync(id);
        if (delivery == null)
        {
            return NotFound("Delivery not found");
        }

        delivery.addres = updatedDelivery.addres;
        delivery.delivery_date = updatedDelivery.delivery_date;
        delivery.status = updatedDelivery.status;
        delivery.driver_id = updatedDelivery.driver_id;

        await _context.SaveChangesAsync();
        return Ok(delivery);
    }

    [HttpPut("driver/{driverId}")]
    public async Task<IActionResult> UpdateDriverStatus(int driverId, [FromBody] bool occupied)
    {
        var driver = await _context.Drivers.FindAsync(driverId);
        if (driver == null)
        {
            return NotFound("Driver not found");
        }

        driver.occupied = occupied;
        await _context.SaveChangesAsync();
        return Ok(driver);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDelivery(int id)
    {
        var delivery = await _context.Deliveries.FindAsync(id);
        if (delivery == null)
        {
            return NotFound("Delivery not found");
        }

        _context.Deliveries.Remove(delivery);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("driver/{driverId}")]
    public async Task<IActionResult> DeleteDriver(int driverId)
    {
        var driver = await _context.Drivers.FindAsync(driverId);
        if (driver == null)
        {
            return NotFound("Driver not found");
        }

        _context.Drivers.Remove(driver);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}