import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById, getMenuItems } from '@/lib/api';
import { MealCard } from '@/components/MealCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Clock, Truck, Loader } from 'lucide-react';
import { Restaurant, Meal } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantAndMeals = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch restaurant details
        const restaurantData = await getRestaurantById(id);
        
        // Map the API response to match the Restaurant interface
        const mappedRestaurant: Restaurant = {
          id: restaurantData._id || restaurantData.id,
          name: restaurantData.name,
          image: restaurantData.imageUrl || restaurantData.image,
          cuisine: restaurantData.cuisine || 'Various',
          rating: restaurantData.rating || 0,
          deliveryTime: restaurantData.preparationTime || restaurantData.deliveryTime || '30-40 min',
          deliveryFee: restaurantData.deliveryFee || 0,
          description: restaurantData.description || '',
        };
        
        setRestaurant(mappedRestaurant);
        
        // Fetch meals for this restaurant
        const mealsData = await getMenuItems(id);
        
        // Map meals to match Meal interface
        const mappedMeals: Meal[] = mealsData.map((item: any) => ({
          id: item.id?.toString() || `m${Math.random()}`,
          name: item.item_name || 'Unnamed Item',
          description: item.description || '',
          price: (item.price_cents || 0) / 100, // Convert cents to dollars
          image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
          restaurantId: id,
          category: item.tags || 'Food',
        }));
        
        setMeals(mappedMeals);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch restaurant or meals:', err);
        setError(err.message || 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndMeals();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader className="w-8 h-8 text-primary animate-spin mb-2" />
        <p className="text-muted-foreground">Loading restaurant...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-muted-foreground mb-4">{error || 'Restaurant not found'}</p>
        <Button onClick={() => navigate('/restaurants')}>Back to Restaurants</Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header Image */}
      <div className="relative h-56">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Restaurant Info */}
      <div className="px-4 -mt-8 relative">
        <div className="bg-card rounded-xl p-4 shadow-soft">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
              <p className="text-primary font-medium">{restaurant.cuisine}</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-warning/10 rounded-full">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-semibold text-warning">{restaurant.rating}</span>
            </div>
          </div>
          
          {restaurant.description && (
            <p className="text-sm text-muted-foreground mb-4">{restaurant.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-primary" />
              <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <section className="px-4 mt-6">
        <h2 className="font-semibold text-lg mb-4">Menu ({meals.length} items)</h2>
        <div className="grid grid-cols-2 gap-3">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onClick={() => setSelectedMeal(meal)}
            />
          ))}
        </div>
        {meals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No meals available</p>
          </div>
        )}
      </section>

      {/* Meal Detail Modal */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {selectedMeal && (
            <>
              <div className="relative h-48">
                <img
                  src={selectedMeal.image}
                  alt={selectedMeal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
              <div className="p-5 -mt-8 relative">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-2">
                  {selectedMeal.category}
                </span>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedMeal.name}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground mt-3">
                  {selectedMeal.description}
                </p>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-2xl font-bold text-primary">
                    ${selectedMeal.price.toFixed(2)}
                  </span>
                  {user?.role === UserRole.CUSTOMER && (
                    <Button
                      variant="gradient"
                      onClick={() => {
                        addToCart(selectedMeal);
                        setSelectedMeal(null);
                      }}
                    >
                      Add to Order
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
