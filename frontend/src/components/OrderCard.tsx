import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Clock } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const statusColors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    preparing: 'bg-primary/10 text-primary border-primary/20',
    'on-the-way': 'bg-accent/10 text-accent border-accent/20',
    delivered: 'bg-success/10 text-success border-success/20',
  };

  const statusLabels = {
    pending: 'Pending',
    preparing: 'Preparing',
    'on-the-way': 'On the Way',
    delivered: 'Delivered',
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Order #{order.id}</CardTitle>
          <Badge variant="outline" className={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-medium">{order.restaurantName}</span>
        </div>
        
        <div className="space-y-1.5 pl-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-muted-foreground">
              <span>{item.quantity}x {item.meal.name}</span>
              <span>${(item.meal.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 text-sm pt-2 border-t border-border">
          <MapPin className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerAddress}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
          </div>
          <span className="font-bold text-primary">${order.total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
