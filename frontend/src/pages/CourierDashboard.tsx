import { orders } from '@/data/mockData';
import { OrderCard } from '@/components/OrderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Package, CheckCircle, Clock } from 'lucide-react';

export default function CourierDashboard() {
  const activeOrders = orders.filter((o) => o.status === 'on-the-way');
  const pendingOrders = orders.filter((o) => o.status === 'preparing' || o.status === 'pending');

  const stats = {
    active: activeOrders.length,
    pending: pendingOrders.length,
    completed: 12, // Mock data
    earnings: 156.50, // Mock data
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
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
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
        <div className="space-y-4">
          {activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {activeOrders.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No active deliveries
            </p>
          )}
        </div>
      </section>

      {/* Pending Orders */}
      <section className="px-4">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          Ready for Pickup
        </h2>
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {pendingOrders.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No pending orders
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
