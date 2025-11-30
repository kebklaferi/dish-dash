namespace CatalogService.Models;

public class MenuItems
{
    public int id { get; set; }
    public int restaurant_id { get; set; }
    public string item_name { get; set; } = default;
    public int price_cents { get; set; }
    public bool available { get; set; }
    
}