using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/catalog")]
public class MenuController : ControllerBase
{
    private readonly CatalogDbContext _dbContext;
    
    public MenuController(CatalogDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<List<Models.MenuItemDto>>> GetMenuItems([FromQuery(Name = "restaurantId")] int restaurantId)
    {
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
        
        return Ok(dtos);
    }

    [HttpGet("{itemId:int}")]
    public async Task<ActionResult<Models.MenuItemDto>> GetMenuItem(int restaurant, int itemId)
    {
        var item = await _dbContext.MenuItems
            .FirstOrDefaultAsync(i => i.restaurant_id == restaurant && i.id == itemId && i.available);
      
        if (item == null)
        {
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
        
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<Models.MenuItemDto2>> AddMenuItem(int restaurant, [FromBody] Models.MenuItems menuItem)
    {
        menuItem.restaurant_id = restaurant;
        _dbContext.MenuItems.Add(menuItem);
        await _dbContext.SaveChangesAsync();
        
        var dto = new Models.MenuItemDto2
        {
            item_name = menuItem.item_name,
            price_cents = menuItem.price_cents,
            available = menuItem.available,
            description = menuItem.description,
            tags = menuItem.tags
        };
        
        return CreatedAtAction(nameof(GetMenuItem), new { resturant = restaurant, itemId = menuItem.id }, dto);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<List<Models.MenuItemDto2>>> CreateItemsBulk(int restaurantId, [FromBody] List<Models.MenuItems> menuItems)
    {
        foreach (var item in menuItems)
        {
            item.restaurant_id = restaurantId;
        }

        await _dbContext.MenuItems.AddRangeAsync(menuItems);
        await _dbContext.SaveChangesAsync();
        
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
    
    [HttpPut("{itemId:int}")]
    public async Task<IActionResult> UpdateMenuItem(int restaurant, int itemId, [FromBody] Models.MenuItems updatedItem)
    {
        var existingItem = await _dbContext.MenuItems
            .FirstOrDefaultAsync(i => i.restaurant_id == restaurant && i.id == itemId);
        
        if (existingItem == null)
        {
            return NotFound();
        }

        existingItem.item_name = updatedItem.item_name;
        existingItem.price_cents = updatedItem.price_cents;
        existingItem.available = updatedItem.available;

        await _dbContext.SaveChangesAsync();
        
        Console.WriteLine($"Event: ItemUpdated {existingItem.id}");
        
        return NoContent();
    }

    [HttpPut("{itemId:int}/availability")]
    public async Task<ActionResult<Models.MenuItemDto>> UpdateMenuItemAvailability(int restaurant, int itemId, [FromBody] bool availability)
    {
        var existingItem = await _dbContext.MenuItems
            .FirstOrDefaultAsync(i => i.restaurant_id == restaurant && i.id == itemId);
        if (existingItem == null)
        {
            return NotFound();
        }

        existingItem.available = availability;
        await _dbContext.SaveChangesAsync();

        Console.WriteLine($"Event: ItemAvailabilityUpdated {existingItem.id} to {availability}");

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

    [HttpDelete("{itemId:int}")]
    public async Task<IActionResult> DeleteMenuItem(int restaurant, int itemId)
    {
        var existingItem = await _dbContext.MenuItems
            .FirstOrDefaultAsync(i => i.restaurant_id == restaurant && i.id == itemId);
        if (existingItem == null)
        {
            return NotFound();
        }

        _dbContext.MenuItems.Remove(existingItem);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpDelete]
    public async Task<IActionResult> DeleteMenu(int restaurantId)
    {
        var items = await _dbContext.MenuItems
            .Where(i => i.restaurant_id == restaurantId)
            .ToListAsync();
        
        _dbContext.MenuItems.RemoveRange(items);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }
}