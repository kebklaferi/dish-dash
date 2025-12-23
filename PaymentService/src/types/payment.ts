export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CARD = 'CARD'
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  cardBrand?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardholderName: string;
}

export interface ProcessPaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  message?: string;
}

export interface PaymentHistoryEntry {
  id: string;
  paymentId: string;
  status: PaymentStatus;
  message?: string;
  createdAt: Date;
}
