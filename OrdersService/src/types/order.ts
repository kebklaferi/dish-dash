export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  menuItemId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryFee: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  customerId: string;
  restaurantId: number;
  deliveryAddress: string;
  items: {
    menuItemId: number;
    quantity: number;
  }[];
  deliveryFee?: number;
  notes?: string;
  // Payment details
  paymentMethod?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardholderName?: string;
}

export interface UpdateOrderRequest {
  restaurantId: number;
  deliveryAddress?: string;
  items?: {
    menuItemId: number;
    quantity: number;
  }[];
  notes?: string;
  status?: OrderStatus;
}
