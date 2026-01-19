import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, CheckCircle, Clock, MapPin } from 'lucide-react';
import { getAvailableDeliveries, getActiveDeliveries, updateOrderStatus } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Order as OrderType } from '@/types';

export default function CourierDashboard() {
  const [availableOrders, setAvailableOrders] = useState<OrderType[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      const [available, active] = await Promise.all([
        getAvailableDeliveries(),
        getActiveDeliveries(),
      ]);
      setAvailableOrders(available);
      setActiveOrders(active);
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      toast({
        title: 'Error',
        description: 'Failed to load deliveries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'on-the-way');
      toast({
        title: 'Order Accepted',
        description: 'You can now deliver this order',
      });
      fetchDeliveries();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to accept order',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'delivered');
      toast({
        title: 'Delivery Completed',
        description: 'Great job! Order has been marked as delivered',
      });
      setCompletedToday((prev) => prev + 1);
      fetchDeliveries();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to complete delivery',
        variant: 'destructive',
      });
    }
  };

  const earnings = activeOrders.length * 5 + completedToday * 5;

  const stats = {
    active: activeOrders.length,
    available: availableOrders.length,
    completed: completedToday,
    earnings: earnings.toFixed(2),
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold mb-2">Deliveries</h1>
        <p className="text-muted-foreground">Manage your active orders</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.available}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.earnings}</p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Deliveries */}
      <section className="px-4 mb-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          Active Deliveries
        </h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <Card key={order.id} className="animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">Order #{order.id.slice(0, 8)}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      On the Way
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p>{order.deliveryAddress}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <p className="text-muted-foreground">{order.items.length} items</p>
                    </div>
                    <p className="font-bold text-primary">Total: ${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <Button 
                    onClick={() => handleCompleteDelivery(order.id)} 
                    className="w-full"
                    variant="default"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Delivered
                  </Button>
                </CardContent>
              </Card>
            ))}
            {activeOrders.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No active deliveries
              </p>
            )}
          </div>
        )}
      </section>

      {/* Available Orders */}
      <section className="px-4">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          Available for Pickup
        </h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <Card key={order.id} className="animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">Order #{order.id.slice(0, 8)}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={
                        order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        order.status === 'preparing' ? 'bg-primary/10 text-primary border-primary/20' :
                        'bg-purple-500/10 text-purple-500 border-purple-500/20'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p>{order.deliveryAddress}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <p className="text-muted-foreground">{order.items.length} items</p>
                    </div>
                    <p className="font-bold text-primary">Earn: $5.00</p>
                  </div>
                  <Button 
                    onClick={() => handleAcceptOrder(order.id)} 
                    className="w-full"
                    variant="outline"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Accept Delivery
                  </Button>
                </CardContent>
              </Card>
            ))}
            {availableOrders.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No orders available for pickup
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
