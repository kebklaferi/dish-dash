/**
 * Queue Names - Centralized queue definitions
 */
export const QUEUES = {
  // Payment processing queue - OrdersService → PaymentService
  PAYMENT_PROCESS: 'payment.process',
  
  // Payment result queue - PaymentService → OrdersService
  PAYMENT_RESULT: 'payment.result',
} as const;

/**
 * Message Types
 */

// Message sent from OrdersService to PaymentService to process payment
export interface ProcessPaymentMessage {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardholderName: string;
}

// Message sent from PaymentService back to OrdersService with result
export interface PaymentResultMessage {
  orderId: string;
  paymentId: string;
  status: 'COMPLETED' | 'FAILED';
  transactionId?: string;
  errorMessage?: string;
}
