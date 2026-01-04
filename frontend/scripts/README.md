# Database Seeding Scripts

These scripts create sample restaurants and menu items for testing the DishDash application.

## What Gets Created

### Restaurants (2):
1. **Bella Italia** - Italian cuisine
   - Margherita Pizza
   - Pasta Carbonara
   - Lasagna Bolognese
   - Risotto al Tartufo

2. **Spice Garden** - Indian cuisine
   - Chicken Tikka Masala
   - Biryani
   - Paneer Butter Masala
   - Garlic Naan

Total: 2 restaurants, 8 menu items

## Prerequisites

Make sure your services are running:
- Restaurant Service (Port 3003)
- Catalog Service (Port 8080)
- API Gateway (Port 8088)

## Usage

### Option 1: Run with Node.js (Recommended)
```bash
node scripts/seed-data.js
```

### Option 2: Run with TypeScript
```bash
npx ts-node scripts/seed-data.ts
```

## Output Example

```
🌱 Starting database seeding...

===============================

📝 Creating restaurant: Bella Italia...
✅ Restaurant created successfully: 507f1f77bcf86cd799439011

📝 Creating 4 menu items for restaurant...
✅ 4 menu items created successfully

📝 Creating restaurant: Spice Garden...
✅ Restaurant created successfully: 507f1f77bcf86cd799439012

📝 Creating 4 menu items for restaurant...
✅ 4 menu items created successfully

===============================
✨ Database seeding completed successfully!

📊 Summary:
   - Restaurants created: 2
   - Total menu items: 8
```

## Troubleshooting

### Connection refused
- Make sure API Gateway is running on `http://localhost:8088`
- Check that Restaurant Service and Catalog Service are accessible

### Failed to create restaurant
- Check MongoDB is running for Restaurant Service
- Verify restaurant data in the script

### Failed to create menu items
- Check that the restaurant ID was created successfully
- Verify catalog database is running

## Modifying the Data

Edit `scripts/seed-data.js` or `scripts/seed-data.ts` to add or modify:
- Restaurant information in the `restaurants` array
- Menu items in the `mealsByRestaurant` object
