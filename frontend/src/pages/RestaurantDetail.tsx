import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById } from '@/lib/api';
import { useMeals } from '@/context/MealsContext';
import { MealCard } from '@/components/MealCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Clock, Truck, MapPin } from 'lucide-react';
import { Restaurant } from '@/types';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMealsByRestaurant } = useMeals();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getRestaurantById(id);
        
        // Map the API response to match the Restaurant interface
        const mappedRestaurant: Restaurant = {
          id: data._id || data.id,
          name: data.name,
          image: data.imageUrl || data.image,
          cuisine: data.cuisine || 'Various',
          rating: data.rating || 0,
          deliveryTime: data.preparationTime || data.deliveryTime || '30-40 min',
          deliveryFee: data.deliveryFee || 0,
          description: data.description || '',
        };
        
        setRestaurant(mappedRestaurant);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch restaurant:', err);
        setError(err.message || 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const meals = restaurant ? getMealsByRestaurant(restaurant.id) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
        {meals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No meals available</p>
          </div>
        )}
      </section>
    </div>
  );
}
