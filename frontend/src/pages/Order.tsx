import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingBag, ArrowLeft, Trash2, ChevronRight, Package, Loader, CreditCard, Banknote } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getUserOrders, createOrder } from '@/lib/api';

export default function Order() {
  const navigate = useNavigate();
  const { items, total, clearCart, itemCount } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'CASH_ON_DELIVERY'>('CASH_ON_DELIVERY');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const deliveryFee = items.length > 0 ? 2.99 : 0;
  const grandTotal = total + deliveryFee;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const data = await getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'CREDIT_CARD') {
      if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
        toast({
          title: "Missing Payment Information",
          description: "Please fill in all credit card details",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsPlacingOrder(true);

      // Group items by restaurant
      const itemsByRestaurant = items.reduce((acc, item) => {
        const restaurantId = item.meal.restaurantId || '1';
        if (!acc[restaurantId]) {
          acc[restaurantId] = [];
        }
        acc[restaurantId].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      // Calculate delivery fee per restaurant
      const deliveryFeePerRestaurant = deliveryFee / Object.keys(itemsByRestaurant).length;

      // Create orders for each restaurant
      const orderPromises = Object.entries(itemsByRestaurant).map(([restaurantId, restaurantItems]) => {
        const orderData = {
          restaurantId: restaurantId.toString(),
          deliveryAddress: deliveryAddress.trim(),
          items: restaurantItems.map(item => ({
            menuItemId: item.meal.id.toString(),
            quantity: item.quantity,
          })),
          deliveryFee: deliveryFeePerRestaurant,
          payment: {
            method: paymentMethod,
            ...(paymentMethod === 'CREDIT_CARD' && {
              cardNumber,
              expiryMonth,
              expiryYear,
              cvv,
              cardholderName,
            }),
          },
        };
        return createOrder(orderData);
      });

      // Wait for all orders to be created
      await Promise.all(orderPromises);

      const restaurantCount = Object.keys(itemsByRestaurant).length;
      toast({
        title: "Order Placed!",
        description: restaurantCount > 1 
          ? `${restaurantCount} orders have been successfully placed from different restaurants.`
          : "Your order has been successfully placed. A courier will pick it up soon!",
      });

      clearCart();
      navigate('/');
    } catch (err: any) {
      toast({
        title: "Order Failed",
        description: err.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'out_for_delivery':
        return 'text-blue-600 bg-blue-50';
      case 'preparing':
        return 'text-yellow-600 bg-yellow-50';
      case 'confirmed':
        return 'text-purple-600 bg-purple-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (items.length === 0) {
    return (
      <div className="pb-24">
        {/* Order History Section */}
        <div className="px-4 py-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Your Orders</h2>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {isLoadingOrders ? '...' : orders.length}
            </span>
          </div>
          {isLoadingOrders ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.items?.length || 0} item(s)
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-primary">
                        ${((order.total_amount_cents || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No orders yet. Place your first order!</p>
            </div>
          )}
        </div>

        {/* Empty Cart Message */}
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-4">
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
      </div>
    );
  }

  return (
    <div className="pb-48">
      {/* Current Cart Header */}
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

      {/* Delivery Address */}
      <div className="px-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="address" className="text-sm font-medium mb-2 block">
              Delivery Address
            </Label>
            <Input
              id="address"
              placeholder="Enter your delivery address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Payment Method */}
      <div className="px-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="CASH_ON_DELIVERY" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                  <Banknote className="w-4 h-4" />
                  Cash on Delivery
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CREDIT_CARD" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="w-4 h-4" />
                  Credit Card
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'CREDIT_CARD' && (
              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="cardNumber" className="text-xs">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cardholderName" className="text-xs">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="expiryMonth" className="text-xs">Month</Label>
                    <Input
                      id="expiryMonth"
                      placeholder="12"
                      maxLength={2}
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryYear" className="text-xs">Year</Label>
                    <Input
                      id="expiryYear"
                      placeholder="25"
                      maxLength={2}
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-xs">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cart Items */}
      <div className="px-4 space-y-3 mb-6">
        {items.map((item) => (
          <CartItem key={item.meal.id} item={item} />
        ))}
      </div>

      {/* Order History Section */}
      <div className="px-4 py-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Your Orders</h2>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {isLoadingOrders ? '...' : orders.length}
          </span>
        </div>
        {isLoadingOrders ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.items?.length || 0} item(s)
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-primary">
                      ${((order.total_amount_cents || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No orders yet. Place your first order!</p>
          </div>
        )}
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
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  Place Order
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
