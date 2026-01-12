import { useState, useEffect } from 'react';
import { useMeals } from '@/context/MealsContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MealForm } from '@/components/MealForm';
import { Meal } from '@/types';
import { Plus, Edit, Trash2, ChefHat, DollarSign, Package, Loader } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getRestaurantById, getMenuItems } from '@/lib/api';

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  description: string;
  phone?: string;
  email?: string;
  cuisine?: string;
  rating?: number;
  workingHours?: string;
  image?: string;
}

export default function RestaurantDashboard() {
  const { addMeal, updateMeal, deleteMeal } = useMeals();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [myMeals, setMyMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | undefined>();
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  // Fetch restaurant details and menu items
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Using a hardcoded restaurant ID for demo
        const restaurantId = '67580fd8e1cc3f6c43a0d8f7'; // Replace with dynamic ID from auth
        const restaurantData = await getRestaurantById(restaurantId);
        setRestaurant(restaurantData);

        const menuItems = await getMenuItems(parseInt(restaurantId));
        setMyMeals(menuItems);
      } catch (err: any) {
        console.error('Failed to fetch restaurant data:', err);
        setError('Failed to load restaurant data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchRestaurantData();
    }
  }, [user]);

  const handleAddMeal = (mealData: Omit<Meal, 'id'>) => {
    addMeal(mealData);
  };

  const handleEditMeal = (mealData: Omit<Meal, 'id'>) => {
    if (editingMeal) {
      updateMeal(editingMeal.id, mealData);
      setEditingMeal(undefined);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingMealId) {
      deleteMeal(deletingMealId);
      setDeletingMealId(null);
    }
  };

  const totalRevenue = myMeals.reduce((sum, meal) => sum + (meal.price || 0) * 10, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-8 h-8 text-primary animate-spin mb-2" />
        <p className="text-muted-foreground">Loading restaurant data...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive mb-4">{error || 'Restaurant not found'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-xl overflow-hidden">
            <img
              src={restaurant.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop'}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">{restaurant.name}</h1>
            <p className="text-sm text-primary">{restaurant.cuisine || 'Restaurant'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{myMeals.length}</p>
              <p className="text-xs text-muted-foreground">Menu Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ChefHat className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">Orders Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">${totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Menu Management */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Menu Items</h2>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => {
              setEditingMeal(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Meal
          </Button>
        </div>

        <div className="space-y-3">
          {myMeals.map((meal) => (
            <Card key={meal.id} className="animate-fade-in">
              <CardContent className="p-3 flex items-center gap-3">
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{meal.name}</h4>
                  <p className="text-sm text-muted-foreground">{meal.category}</p>
                  <p className="text-sm font-bold text-primary">${meal.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => {
                      setEditingMeal(meal);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingMealId(meal.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {myMeals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No meals in your menu yet</p>
            <Button variant="gradient" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Meal
            </Button>
          </div>
        )}
      </section>

      {/* Meal Form Modal */}
      <MealForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMeal(undefined);
        }}
        onSubmit={editingMeal ? handleEditMeal : handleAddMeal}
        meal={editingMeal}
        restaurantId={restaurant._id}
        restaurantName={restaurant.name}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMealId} onOpenChange={() => setDeletingMealId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
