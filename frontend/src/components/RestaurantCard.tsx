import { Restaurant } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Clock, Truck } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer group animate-fade-in"
      onClick={onClick}
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-card/90 backdrop-blur-sm rounded-full">
          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
          <span className="text-sm font-medium">{restaurant.rating}</span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-1">{restaurant.name}</h3>
        <p className="text-sm text-primary font-medium mb-3">{restaurant.cuisine}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>${restaurant.deliveryFee.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
