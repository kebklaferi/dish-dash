import { Meal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface MealCardProps {
  meal: Meal;
  onClick?: () => void;
}

export function MealCard({ meal, onClick }: MealCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(meal);
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer group animate-fade-in"
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={meal.image}
          alt={meal.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-card/90 backdrop-blur-sm rounded-full text-foreground">
            {meal.category}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{meal.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{meal.restaurantName}</p>
          </div>
          <span className="font-bold text-primary ml-2">${meal.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {meal.description}
        </p>
        {user?.role === UserRole.CUSTOMER && (
          <Button
            variant="gradient"
            size="sm"
            className="w-full"
            onClick={handleAddToCart}
          >
            <Plus className="w-4 h-4" />
            Add to Order
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
