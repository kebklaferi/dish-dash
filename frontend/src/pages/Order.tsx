import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, ArrowLeft, Trash2, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Order() {
  const navigate = useNavigate();
  const { items, total, clearCart, itemCount } = useCart();

  const deliveryFee = items.length > 0 ? 2.99 : 0;
  const grandTotal = total + deliveryFee;

  const handlePlaceOrder = () => {
    toast({
      title: "Order Placed!",
      description: "Your order has been successfully placed. A courier will pick it up soon!",
    });
    clearCart();
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground text-center mb-6">
          Browse our delicious meals and add them to your order
        </p>
        <Button variant="gradient" onClick={() => navigate('/')}>
          Browse Meals
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-48">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Your Order</h1>
            <p className="text-sm text-muted-foreground">{itemCount} items</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={clearCart}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Cart Items */}
      <div className="px-4 space-y-3">
        {items.map((item) => (
          <CartItem key={item.meal.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="fixed bottom-20 left-0 right-0 p-4 glass-effect border-t border-border">
        <Card className="border-0 shadow-soft-lg">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handlePlaceOrder}
            >
              Place Order
              <ChevronRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
