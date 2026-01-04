using DeliveryService.Client;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeliveryService.Controllers;

[ApiController]
[Route("api/delivery")]
public class DeliveriesController : ControllerBase
{
    private readonly DeliveryDbContext _context;
    private readonly ILogger<DeliveriesController> _logger;
    private readonly NotificationClient _notificationClient;

    public DeliveriesController(DeliveryDbContext context, NotificationClient notificationClient, ILogger<DeliveriesController> logger)
    {
        _context = context;
        _notificationClient = notificationClient;
        _logger = logger;
        
    }
    
    [HttpPost("driver")]
    public async Task<IActionResult> AddDriver([FromBody] Models.Driver driver)
    {
        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetDriverStatus), new { driverId = driver.id }, driver);
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignDelivery([FromBody] Models.AssignDelivery assignDelivery)
    {
        var driver = await _context.Drivers.FirstOrDefaultAsync(d => !d.occupied);

        if (driver == null)
        {
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

        await _notificationClient.SendDeliveryNotificationAsync(
            userId: $"order_{assignDelivery.order_id}",
            title: "Delivery Assigned",
            message: $"Your delivery has been assigned to driver {driver.name}. Expected delivery: {delivery.delivery_date:HH:mm}",
            type: "delivery",
            priority: "medium");
        
        return Ok(delivery);
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
        
        var notificationMessage = status switch
        {
            "Picked Up" => "Your order has been picked up and is on its way!",
            "In Transit" => "Your delivery is in transit.",
            "Delivered" => "Your order has been delivered! Enjoy your meal!",
            "Cancelled" => "Your delivery has been cancelled.",
            _ => $"Delivery status updated to: {status}"
        };

        await _notificationClient.SendDeliveryNotificationAsync(
            userId: $"order_{delivery.order_id}",
            title: $"Delivery Update: {status}",
            message: notificationMessage,
            type: "delivery",
            priority: status == "Delivered" ? "high" : "medium"
        );
        
        
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