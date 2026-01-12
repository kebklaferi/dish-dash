#!/usr/bin/env node

/**
 * Seed script to create restaurants and meals
 * Run with: node scripts/seed-data.js
 * Or with custom API URL: API_URL=http://api.example.com node scripts/seed-data.js
 */

const API_BASE_URL = 'http://localhost:8088/api';

const restaurants = [
  {
    name: 'Bella Italia',
    address: '123 Main St, Downtown',
    description: 'Authentic Italian cuisine with fresh pasta and wood-fired pizzas',
    workingHours: '11:00 AM - 11:00 PM',
    phone: '+1-555-0101',
    email: 'info@bellaitalia.com',
    cuisine: 'Italian'
  },
  {
    name: 'Spice Garden',
    address: '456 Oak Ave, Midtown',
    description: 'Delicious Indian food with rich flavors and traditional recipes',
    workingHours: '12:00 PM - 10:00 PM',
    phone: '+1-555-0102',
    email: 'info@spicegarden.com',
    cuisine: 'Indian'
  },
];

const mealsByRestaurant = {
  'Bella Italia': [
    {
      item_name: 'Margherita Pizza',
      price_cents: 1499,
      available: true
    },
    {
      item_name: 'Pasta Carbonara',
      price_cents: 1299,
      available: true
    },
    {
      item_name: 'Lasagna Bolognese',
      price_cents: 1399,
      available: true
    },
    {
      item_name: 'Risotto al Tartufo',
      price_cents: 1699,
      available: true
    },
  ],
  'Spice Garden': [
    {
      item_name: 'Chicken Tikka Masala',
      price_cents: 1399,
      available: true
    },
    {
      item_name: 'Biryani',
      price_cents: 1299,
      available: true
    },
    {
      item_name: 'Paneer Butter Masala',
      price_cents: 1199,
      available: true
    },
    {
      item_name: 'Garlic Naan',
      price_cents: 399,
      available: true
    },
  ],
};

async function createRestaurant(restaurantData) {
  try {
    console.log(`\n📝 Creating restaurant: ${restaurantData.name}...`);
    
    const response = await fetch(`${API_BASE_URL}/restaurant/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(restaurantData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create restaurant');
    }

    const data = await response.json();
    const restaurantId = data.data?._id || data._id;
    
    console.log(`✅ Restaurant created successfully: ${restaurantId}`);
    return restaurantId;
  } catch (err) {
    console.error(`❌ Error creating restaurant ${restaurantData.name}:`, err.message);
    throw err;
  }
}

async function createMenuItems(restaurantId, items) {
  try {
    console.log(`\n📝 Creating ${items.length} menu items for restaurant...`);
    
    const response = await fetch(`${API_BASE_URL}/catalog/menus/bulk?restaurantId=${restaurantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create menu items');
    }

    console.log(`✅ ${items.length} menu items created successfully`);
  } catch (err) {
    console.error(`❌ Error creating menu items:`, err.message);
    throw err;
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    console.log('===============================');

    for (const restaurantData of restaurants) {
      const restaurantId = await createRestaurant(restaurantData);
      const meals = mealsByRestaurant[restaurantData.name];
      
      if (meals) {
        await createMenuItems(restaurantId, meals);
      }
    }

    console.log('\n===============================');
    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Restaurants created: ${restaurants.length}`);
    const totalMeals = Object.values(mealsByRestaurant).reduce((sum, meals) => sum + meals.length, 0);
    console.log(`   - Total menu items: ${totalMeals}`);
  } catch (err) {
    console.error('\n❌ Database seeding failed:', err.message);
    process.exit(1);
  }
}

// Run the seed script
seedDatabase();
