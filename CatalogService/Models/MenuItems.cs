
namespace CatalogService.Models;

public class MenuItems
{
    public int id { get; set; }
    public string restaurant_id { get; set; } = default!;
    public string item_name { get; set; } = default!;
    public int price_cents { get; set; }
    public bool available { get; set; }
    public string description { get; set; } = default!;
    public string tags { get; set; } = default!;
    public string imgUrl { get; set; } = "https://media.cnn.com/api/v1/images/stellar/prod/140430115517-06-comfort-foods.jpg?q=w_1110,c_fill";
    
}