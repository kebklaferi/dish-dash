using Microsoft.EntityFrameworkCore;

namespace CatalogService.MockData;

public class DataSeeder
{
    public static async Task SeedAsync(CatalogDbContext dbContext)
    {
        if (await dbContext.MenuItems.AnyAsync())
        {
            return; // Data already seeded
        }
        
        if (!dbContext.MenuItems.Any())
        {
            var items = new List<Models.MenuItems>
            {
                // Restaurant 1 - Pizza Place
                new() { 
                    restaurant_id = 1, 
                    item_name = "Margherita Pizza", 
                    price_cents = 1299, 
                    available = true,
                    description = "Classic pizza with fresh mozzarella, tomato sauce, and basil",
                    tags = "Pizza"
                },
                new() { 
                    restaurant_id = 1, 
                    item_name = "Pepperoni Pizza", 
                    price_cents = 1499, 
                    available = true,
                    description = "Traditional pizza topped with pepperoni and mozzarella cheese",
                    tags = "Pizza"
                },
                new() { 
                    restaurant_id = 1, 
                    item_name = "Hawaiian Pizza", 
                    price_cents = 1599, 
                    available = false,
                    description = "Pizza with ham, pineapple, and mozzarella cheese",
                    tags = "Pizza"
                },
                new() { 
                    restaurant_id = 1, 
                    item_name = "Caesar Salad", 
                    price_cents = 899, 
                    available = true,
                    description = "Fresh romaine lettuce with caesar dressing, croutons, and parmesan",
                    tags = "Salad"
                },
                new() { 
                    restaurant_id = 1, 
                    item_name = "Garlic Bread", 
                    price_cents = 599, 
                    available = true,
                    description = "Toasted bread with garlic butter and herbs",
                    tags = "Bread"
                },

                // Restaurant 2 - Burger Joint
                new() { 
                    restaurant_id = 2, 
                    item_name = "Classic Burger", 
                    price_cents = 1099, 
                    available = true,
                    description = "Beef patty with lettuce, tomato, onion, and pickles",
                    tags = "Burger"
                },
                new() { 
                    restaurant_id = 2, 
                    item_name = "Cheeseburger", 
                    price_cents = 1199, 
                    available = true,
                    description = "Classic burger topped with melted cheddar cheese",
                    tags = "Burger"
                },
                new() { 
                    restaurant_id = 2, 
                    item_name = "Bacon Burger", 
                    price_cents = 1399, 
                    available = true,
                    description = "Juicy beef burger with crispy bacon and cheese",
                    tags = "Burger"
                },
                new() { 
                    restaurant_id = 2, 
                    item_name = "French Fries", 
                    price_cents = 499, 
                    available = true,
                    description = "Crispy golden potato fries seasoned with salt",
                    tags = "Side"
                },
                new() { 
                    restaurant_id = 2, 
                    item_name = "Onion Rings", 
                    price_cents = 599, 
                    available = false,
                    description = "Beer-battered onion rings served with ranch dipping sauce",
                    tags = "Side"
                },

                // Restaurant 3 - Asian Cuisine
                new() { 
                    restaurant_id = 3, 
                    item_name = "Chicken Pad Thai", 
                    price_cents = 1299, 
                    available = true,
                    description = "Stir-fried rice noodles with chicken, bean sprouts, and tamarind sauce",
                    tags = "Noodles"
                },
                new() { 
                    restaurant_id = 3, 
                    item_name = "Beef Teriyaki", 
                    price_cents = 1599, 
                    available = true,
                    description = "Grilled beef glazed with sweet teriyaki sauce, served with rice",
                    tags = "Beef,Rice"
                },
                new() { 
                    restaurant_id = 3, 
                    item_name = "Vegetable Spring Rolls", 
                    price_cents = 799, 
                    available = true,
                    description = "Fresh vegetables wrapped in rice paper, served with peanut dipping sauce",
                    tags = "vegetarian,fresh"
                },
                new() { 
                    restaurant_id = 3, 
                    item_name = "Miso Soup", 
                    price_cents = 399, 
                    available = true,
                    description = "Traditional Japanese soup with miso paste, tofu, and seaweed",
                    tags = "Soup"
                },
                new() { 
                    restaurant_id = 3, 
                    item_name = "Green Tea Ice Cream", 
                    price_cents = 499, 
                    available = true,
                    description = "Creamy ice cream infused with matcha green tea flavor",
                    tags = "Dessert"
                }
            };

            await dbContext.MenuItems.AddRangeAsync(items);
            await dbContext.SaveChangesAsync();
        }
    }
}