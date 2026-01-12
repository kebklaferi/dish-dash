import { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { meal, quantity } = item;

  return (
    <div className="flex gap-3 p-3 bg-card rounded-xl shadow-soft animate-fade-in">
      <img
        src={meal.image}
        alt={meal.name}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">{meal.name}</h4>
        <p className="text-sm text-muted-foreground">{meal.restaurantName}</p>
        <p className="text-sm font-bold text-primary mt-1">
          ${(meal.price * quantity).toFixed(2)}
        </p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => removeFromCart(meal.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(meal.id, quantity - 1)}
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <span className="w-6 text-center font-semibold">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(meal.id, quantity + 1)}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
