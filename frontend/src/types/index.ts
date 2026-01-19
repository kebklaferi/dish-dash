export enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT = 'restaurant',
  COURIER = 'courier',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  description?: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  category: string;
}

export interface CartItem {
  meal: Meal;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions: string | null;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  deliveryAddress: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on-the-way' | 'delivered' | 'cancelled';
  deliveryFee: number;
  paymentMethod: 'CREDIT_CARD' | 'CASH_ON_DELIVERY';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
