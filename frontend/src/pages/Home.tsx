import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeals } from '@/context/MealsContext';
import { MealCard } from '@/components/MealCard';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, TrendingUp, Loader } from 'lucide-react';
import { Meal } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { getAllMenuItems } from '@/lib/api';

export default function Home() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllMenuItems();
        // Map API response to Meal type
        const mappedMeals = data.map((item: any) => ({
          id: item.id?.toString() || `m${Math.random()}`,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
          restaurantId: item.restaurant_id?.toString() || 'unknown',
          restaurantName: item.restaurantName || 'Restaurant',
          category: item.category || 'Food',
        }));
        setMeals(mappedMeals);
      } catch (err: any) {
        console.error('Failed to fetch meals:', err);
        setError('Failed to load meals. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const filteredMeals = useMemo(() => {
    if (!search) {
      // Return shuffled meals
      return [...meals].sort(() => Math.random() - 0.5);
    }
    return meals.filter(
      (meal) =>
        meal.name.toLowerCase().includes(search.toLowerCase()) ||
        meal.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
        meal.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [meals, search]);

  const featuredMeals = useMemo(() => {
    return [...meals].sort(() => Math.random() - 0.5).slice(0, 4);
  }, [meals]);

  const categories = useMemo(() => {
    const cats = [...new Set(meals.map((m) => m.category))];
    return cats.slice(0, 6);
  }, [meals]);

  return (
    <div className="pb-24">
      {/* Search Section */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search meals, restaurants..."
            className="pl-10 h-12 bg-muted border-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Featured Section */}
      {!search && (
        <section className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-lg">Featured Today</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {featuredMeals.map((meal) => (
              <div
                key={meal.id}
                className="flex-shrink-0 w-64 cursor-pointer"
                onClick={() => setSelectedMeal(meal)}
              >
                <div className="relative h-32 rounded-xl overflow-hidden">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-primary-foreground">
                    <p className="font-semibold truncate">{meal.name}</p>
                    <p className="text-sm opacity-80">${meal.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {!search && (
        <section className="px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearch(cat)}
                className="flex-shrink-0 px-4 py-2 bg-muted rounded-full text-sm font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Meals Grid */}
      <section className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">
            {search ? `Results for "${search}"` : 'Popular Near You'}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-muted-foreground">Loading meals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onClick={() => setSelectedMeal(meal)}
                />
              ))}
            </div>
            {filteredMeals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No meals found</p>
              </div>
            )}
          </>
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
                <p
                  className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => {
                    setSelectedMeal(null);
                    navigate(`/restaurants/${selectedMeal.restaurantId}`);
                  }}
                >
                  {selectedMeal.restaurantName}
                </p>
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
