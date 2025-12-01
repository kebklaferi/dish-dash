export const RESTAURANTS = [
  {
    id: "rest_001",
    name: "Pizza Palace",
    address: "123 Main Street, Downtown",
    cuisine: "Italian",
    rating: 4.5,
  },
  {
    id: "rest_002",
    name: "Burger Haven",
    address: "456 Oak Avenue, Midtown",
    cuisine: "American",
    rating: 4.2,
  },
  {
    id: "rest_003",
    name: "Sushi Express",
    address: "789 Pine Road, Uptown",
    cuisine: "Japanese",
    rating: 4.7,
  },
];

export const MENU_ITEMS = [
  // Pizza Palace Menu
  {
    id: "menu_001",
    restaurantId: "rest_001",
    name: "Margherita Pizza",
    description: "Classic tomato sauce, mozzarella, and basil",
    price: 12.99,
    category: "Pizza",
    available: true,
  },
  {
    id: "menu_002",
    restaurantId: "rest_001",
    name: "Pepperoni Pizza",
    description: "Tomato sauce, mozzarella, and pepperoni",
    price: 14.99,
    category: "Pizza",
    available: true,
  },
  {
    id: "menu_003",
    restaurantId: "rest_001",
    name: "Caesar Salad",
    description: "Romaine lettuce, parmesan, croutons, Caesar dressing",
    price: 8.99,
    category: "Salad",
    available: true,
  },
  // Burger Haven Menu
  {
    id: "menu_004",
    restaurantId: "rest_002",
    name: "Classic Cheeseburger",
    description: "Beef patty, cheese, lettuce, tomato, pickles",
    price: 10.99,
    category: "Burger",
    available: true,
  },
  {
    id: "menu_005",
    restaurantId: "rest_002",
    name: "Bacon Burger",
    description: "Beef patty, bacon, cheese, BBQ sauce",
    price: 12.99,
    category: "Burger",
    available: true,
  },
  {
    id: "menu_006",
    restaurantId: "rest_002",
    name: "French Fries",
    description: "Crispy golden fries with sea salt",
    price: 4.99,
    category: "Sides",
    available: true,
  },
  // Sushi Express Menu
  {
    id: "menu_007",
    restaurantId: "rest_003",
    name: "California Roll",
    description: "Crab, avocado, cucumber",
    price: 9.99,
    category: "Roll",
    available: true,
  },
  {
    id: "menu_008",
    restaurantId: "rest_003",
    name: "Spicy Tuna Roll",
    description: "Tuna, spicy mayo, cucumber",
    price: 11.99,
    category: "Roll",
    available: true,
  },
  {
    id: "menu_009",
    restaurantId: "rest_003",
    name: "Miso Soup",
    description: "Traditional Japanese soup with tofu",
    price: 3.99,
    category: "Soup",
    available: true,
  },
];

export function getRestaurantById(id: string) {
  return RESTAURANTS.find((r) => r.id === id);
}

export function getMenuItemById(id: string) {
  return MENU_ITEMS.find((m) => m.id === id);
}

export function getMenuItemsByRestaurant(restaurantId: string) {
  return MENU_ITEMS.filter((m) => m.restaurantId === restaurantId);
}
