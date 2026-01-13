export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "CREDIT_CARD" | "CASH_ON_DELIVERY";

export interface PaymentInfo {
  method: PaymentMethod;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
}

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
  paymentMethod: PaymentMethod;
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
  paymentMethod: PaymentMethod;
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
