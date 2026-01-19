import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Store, UtensilsCrossed, Shield, Star, Clock, Package } from 'lucide-react';
import { getAllUsers, getAllRestaurants, getAllMenuItems, getAllOrders } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersData, restaurantsData, mealsData, ordersData] = await Promise.all([
          getAllUsers(),
          getAllRestaurants(),
          getAllMenuItems(),
          getAllOrders(),
        ]);
        setUsers(usersData);
        setRestaurants(restaurantsData);
        setMeals(mealsData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        toast({
          title: 'Error',
          description: 'Failed to load admin panel data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    users: users.length,
    restaurants: restaurants.length,
    meals: meals.length,
    orders: orders.length,
  };

  const roleBadges = {
    customer: 'bg-primary/10 text-primary',
    restaurant: 'bg-accent/10 text-accent',
    courier: 'bg-warning/10 text-warning',
    admin: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage your platform</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.users}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Store className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">{stats.restaurants}</p>
              <p className="text-xs text-muted-foreground">Restaurants</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UtensilsCrossed className="w-6 h-6 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">{stats.meals}</p>
              <p className="text-xs text-muted-foreground">Meals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{stats.orders}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              users.map((user) => (
                <Card key={user.id} className="animate-fade-in">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{user.username || 'Unknown'}</h4>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge variant="secondary" className={roleBadges[user.role] || 'bg-gray-100'}>
                      {user.role}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No restaurants found</div>
            ) : (
              restaurants.map((restaurant) => (
                <Card key={restaurant._id} className="animate-fade-in">
                  <CardContent className="p-4 flex items-center gap-3">
                    <img
                      src={restaurant.imageUrl || '/placeholder-restaurant.jpg'}
                      alt={restaurant.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{restaurant.name}</h4>
                      <p className="text-sm text-primary">{restaurant.address}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          {restaurant.rating || '0'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {restaurant.preparationTime || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="meals" className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : meals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No meals found</div>
            ) : (
              meals.map((meal) => (
                <Card key={meal.id} className="animate-fade-in">
                  <CardContent className="p-4 flex items-center gap-3">
                    <img
                      src={meal.imageUrl || '/placeholder-meal.jpg'}
                      alt={meal.item_name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{meal.item_name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        Restaurant ID: {meal.restaurant_id?.slice(0, 8)}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        ${((meal.price_cents || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <Badge variant="secondary">{meal.tags || 'Other'}</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No orders found</div>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="animate-fade-in">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">Order #{order.id.slice(0, 8)}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className={
                        order.status === 'delivered' ? 'bg-success/10 text-success border-success/20' :
                        order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        order.status === 'preparing' ? 'bg-primary/10 text-primary border-primary/20' :
                        order.status === 'cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-warning/10 text-warning border-warning/20'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Customer:</span> {order.customerId.slice(0, 8)}</p>
                      <p><span className="text-muted-foreground">Restaurant:</span> {order.restaurantId.slice(0, 8)}</p>
                      <p><span className="text-muted-foreground">Address:</span> {order.deliveryAddress}</p>
                      <p><span className="text-muted-foreground">Items:</span> {order.items?.length || 0}</p>
                      <p className="font-bold text-primary pt-2">Total: ${order.totalAmount.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
