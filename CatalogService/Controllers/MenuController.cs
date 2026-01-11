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
    public async Task<IActionResult> GetMenuItems([FromQuery(Name = "restaurantId")] int restaurantId)
    {
        var item = await _dbContext.MenuItems
            .Where(i => i.restaurant_id == restaurantId && i.available)
            .ToListAsync();
        return Ok(item);
    }

    [HttpGet("{itemId:int}")]
    public async Task<IActionResult> GetMenuItem(int restaurant, int itemId)
    {
        var item = await _dbContext.MenuItems
            .FirstOrDefaultAsync(i => i.restaurant_id == restaurant && i.id == itemId && i.available);
      
        if (item == null)
        {
            return NotFound();
        }
        
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddMenuItem(int restaurant, [FromBody] Models.MenuItems menuItem)
    {
        menuItem.restaurant_id = restaurant;
        _dbContext.MenuItems.Add(menuItem);
        await _dbContext.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMenuItem), new { resturant = restaurant, itemId = menuItem.id }, menuItem);
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> CreateItemsBulk(int restaurantId, [FromBody] List<Models.MenuItems> menuItems)
    {
        foreach (var item in menuItems)
        {
            item.restaurant_id = restaurantId;
        }

        await _dbContext.MenuItems.AddRangeAsync(menuItems);
        await _dbContext.SaveChangesAsync();
        return Ok(menuItems);
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
    public async Task<IActionResult> UpdateMenuItemAvailability(int restaurant, int itemId, [FromBody] bool availability)
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

        return Ok(existingItem);
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