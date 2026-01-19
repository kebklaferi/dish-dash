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

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'on-the-way' | 'delivered';
  customerName: string;
  customerAddress: string;
  restaurantName: string;
  createdAt: string;
}
