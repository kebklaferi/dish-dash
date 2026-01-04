import { useState } from 'react';
import { users, restaurants } from '@/data/mockData';
import { useMeals } from '@/context/MealsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Store, UtensilsCrossed, Shield, Star, Clock } from 'lucide-react';

export default function AdminPanel() {
  const { meals } = useMeals();

  const stats = {
    users: users.length,
    restaurants: restaurants.length,
    meals: meals.length,
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
        <div className="grid grid-cols-3 gap-3 mb-6">
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
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3">
            {users.map((user) => (
              <Card key={user.id} className="animate-fade-in">
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{user.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant="secondary" className={roleBadges[user.role]}>
                    {user.role}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-3">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="animate-fade-in">
                <CardContent className="p-4 flex items-center gap-3">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{restaurant.name}</h4>
                    <p className="text-sm text-primary">{restaurant.cuisine}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-warning text-warning" />
                        {restaurant.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {restaurant.deliveryTime}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="meals" className="space-y-3">
            {meals.map((meal) => (
              <Card key={meal.id} className="animate-fade-in">
                <CardContent className="p-4 flex items-center gap-3">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{meal.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {meal.restaurantName}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      ${meal.price.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="secondary">{meal.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
