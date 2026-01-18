using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CatalogService.Logging;
using CatalogService.RabbitMQ;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/catalog")]
public class MenuController : ControllerBase
{
    private readonly CatalogDbContext _dbContext;
    private readonly CorrelationLogger _logger;
    private readonly RabbitMqService _rabbitMq;
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    public MenuController(
        CatalogDbContext dbContext, 
        CorrelationLogger logger,
        RabbitMqService rabbitMq,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _logger = logger;
        _rabbitMq = rabbitMq;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetCorrelationId() 
        => _httpContextAccessor.HttpContext?.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();

    [HttpGet]
    public async Task<ActionResult<List<Models.MenuItemDto>>> GetMenuItems([FromQuery(Name = "restaurantId")] int restaurantId)
    {
        try
        {
            _logger.LogInfo($"Fetching menu items for restaurant {restaurantId}");

            var items = await _dbContext.MenuItems
                .Where(i => i.restaurant_id == restaurantId && i.available)
                .ToListAsync();
                
            var dtos = items.Select(item => new Models.MenuItemDto
            {
                id = item.id,
                item_name = item.item_name,
                price_cents = item.price_cents,
                available = item.available,
                description = item.description,
                tags = item.tags
            }).ToList();

            _logger.LogInfo($"Retrieved {dtos.Count} menu items for restaurant {restaurantId}");
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching menu items for restaurant {restaurantId}", ex);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{itemId:int}")]
    public async Task<ActionResult<Models.MenuItemDto>> GetMenuItem(int restaurant, int itemId)
    {
        try
        {
            _logger.LogInfo($"Fetching menu item {itemId} for restaurant {restaurant}");

            var item = await _dbContext.MenuItems
                .FirstOrDefaultAsync(i => i.restaurant_id == restaurant && i.id == itemId && i.available);
          
            if (item == null)
            {
                _logger.LogInfo($"Menu item {itemId} not found for restaurant {restaurant}");
                return NotFound();
            }
            
            var dto = new Models.MenuItemDto
            {
                id = item.id,
                item_name = item.item_name,
                price_cents = item.price_cents,
                available = item.available,
                description = item.description,
                tags = item.tags
            };

            _logger.LogInfo($"Retrieved menu item {itemId} for restaurant {restaurant}");
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching menu item {itemId} for restaurant {restaurant}", ex);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Models.MenuItemDto2>> AddMenuItem(int restaurant, [FromBody] Models.MenuItemDto2 menuItemDto)
    {
        try
        {
            _logger.LogInfo($"Adding menu item for restaurant {restaurant}", menuItemDto);

            var menuItem = new Models.MenuItems
            {
                restaurant_id = restaurant,
                item_name = menuItemDto.item_name,
                price_cents = menuItemDto.price_cents,
                available = menuItemDto.available,
                description = menuItemDto.description,
                tags = menuItemDto.tags
            };
            
            _dbContext.MenuItems.Add(menuItem);
            await _dbContext.SaveChangesAsync();

            _rabbitMq.PublishEvent("catalog.item.created", new { menuItem.id, restaurant }, GetCorrelationId());
            _logger.LogInfo($"Menu item {menuItem.id} created for restaurant {restaurant}");
            
            var dto = new Models.MenuItemDto
            {
                id = menuItem.id,
                item_name = menuItem.item_name,
                price_cents = menuItem.price_cents,
                available = menuItem.available,
                description = menuItem.description,
                tags = menuItem.tags
            };
            
            return CreatedAtAction(nameof(GetMenuItem), new { restaurant, itemId = menuItem.id }, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error adding menu item for restaurant {restaurant}", ex, menuItemDto);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<List<Models.MenuItemDto2>>> CreateItemsBulk(int restaurantId, [FromBody] List<Models.MenuItemDto2> menuItemDtos)
    {
        try
        {
            _logger.LogInfo($"Bulk creating {menuItemDtos.Count} menu items for restaurant {restaurantId}");

            var menuItems = menuItemDtos.Select(dto => new Models.MenuItems
            {
                restaurant_id = restaurantId,
                item_name = dto.item_name,
                price_cents = dto.price_cents,
                available = dto.available,
                description = dto.description,
                tags = dto.tags
            }).ToList();
            
            await _dbContext.MenuItems.AddRangeAsync(menuItems);
            await _dbContext.SaveChangesAsync();
            
            foreach (var item in menuItems)
            {
                item.restaurant_id = restaurantId;
            }

            _rabbitMq.PublishEvent("catalog.items.bulk_created", new { count = menuItems.Count, restaurantId }, GetCorrelationId());
            _logger.LogInfo($"Bulk created {menuItems.Count} menu items for restaurant {restaurantId}");
            
            var dtos = menuItems.Select(item => new Models.MenuItemDto2
            {
                item_name = item.item_name,
                price_cents = item.price_cents,
                available = item.available,
                description = item.description,
                tags = item.tags
            }).ToList();
            
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error bulk creating menu items for restaurant {restaurantId}", ex);
            return StatusCode(500, "Internal server error");
        }
    }
    
    [HttpPut("{itemId:int}")]
    public async Task<IActionResult> UpdateMenuItem(int restaurant, int itemId, [FromBody] Models.MenuItemDto2 updatedItem)
    {
        try
        {
            _logger.LogInfo($"Updating menu item {itemId} for restaurant {restaurant}", updatedItem);

            var existingItem = await _dbContext.MenuItems
                .FirstOrDefaultAsync(i => i.restaurant_id == restaurant && i.id == itemId);
            
            if (existingItem == null)
            {
                _logger.LogInfo($"Menu item {itemId} not found for restaurant {restaurant}");
                return NotFound();
            }

            existingItem.item_name = updatedItem.item_name;
            existingItem.price_cents = updatedItem.price_cents;
            existingItem.available = updatedItem.available;
            existingItem.description = updatedItem.description;
            existingItem.tags = updatedItem.tags;

            await _dbContext.SaveChangesAsync();

            _rabbitMq.PublishEvent("catalog.item.updated", new { itemId, restaurant }, GetCorrelationId());
            _logger.LogInfo($"Menu item {itemId} updated for restaurant {restaurant}");
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating menu item {itemId} for restaurant {restaurant}", ex, updatedItem);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{itemId:int}/availability")]
    public async Task<ActionResult<Models.MenuItemDto>> UpdateMenuItemAvailability(int restaurant, int itemId, [FromBody] bool availability)
    {
        try
        {
            _logger.LogInfo($"Updating availability for item {itemId} to {availability}");

            var existingItem = await _dbContext.MenuItems
                .FirstOrDefaultAsync(i => i.restaurant_id == restaurant && i.id == itemId);
            if (existingItem == null)
            {
                _logger.LogInfo($"Menu item {itemId} not found for restaurant {restaurant}");
                return NotFound();
            }

            existingItem.available = availability;
            await _dbContext.SaveChangesAsync();

            _rabbitMq.PublishEvent("catalog.item.availability_updated", new { itemId, restaurant, availability }, GetCorrelationId());
            _logger.LogInfo($"Item {itemId} availability updated to {availability}");

            var dto = new Models.MenuItemDto
            {
                id = existingItem.id,
                item_name = existingItem.item_name,
                price_cents = existingItem.price_cents,
                available = existingItem.available,
                description = existingItem.description,
                tags = existingItem.tags
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating availability for item {itemId}", ex, new { availability });
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{itemId:int}")]
    public async Task<IActionResult> DeleteMenuItem(int restaurant, int itemId)
    {
        try
        {
            _logger.LogInfo($"Deleting menu item {itemId} for restaurant {restaurant}");

            var existingItem = await _dbContext.MenuItems
                .FirstOrDefaultAsync(i => i.restaurant_id == restaurant && i.id == itemId);
            if (existingItem == null)
            {
                _logger.LogInfo($"Menu item {itemId} not found for restaurant {restaurant}");
                return NotFound();
            }

            _dbContext.MenuItems.Remove(existingItem);
            await _dbContext.SaveChangesAsync();

            _rabbitMq.PublishEvent("catalog.item.deleted", new { itemId, restaurant }, GetCorrelationId());
            _logger.LogInfo($"Menu item {itemId} deleted for restaurant {restaurant}");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting menu item {itemId} for restaurant {restaurant}", ex);
            return StatusCode(500, "Internal server error");
        }
    }
    
    [HttpDelete]
    public async Task<IActionResult> DeleteMenu(int restaurantId)
    {
        try
        {
            _logger.LogInfo($"Deleting all menu items for restaurant {restaurantId}");

            var items = await _dbContext.MenuItems
                .Where(i => i.restaurant_id == restaurantId)
                .ToListAsync();
            
            _dbContext.MenuItems.RemoveRange(items);
            await _dbContext.SaveChangesAsync();

            _rabbitMq.PublishEvent("catalog.menu.deleted", new { restaurantId, count = items.Count }, GetCorrelationId());
            _logger.LogInfo($"Deleted {items.Count} menu items for restaurant {restaurantId}");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting menu for restaurant {restaurantId}", ex);
            return StatusCode(500, "Internal server error");
        }
    }
}

