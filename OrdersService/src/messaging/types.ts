/**
 * Exchange Names - Centralized exchange definitions
 */
export const EXCHANGES = {
  // Logs exchange - Topic exchange for all service logs
  LOGS: 'logs.exchange',
} as const;

/**
 * Queue Names - Centralized queue definitions
 */
export const QUEUES = {
  // Payment processing queue - OrdersService → PaymentService
  PAYMENT_PROCESS: 'payment.process',
  
  // Payment result queue - PaymentService → OrdersService
  PAYMENT_RESULT: 'payment.result',
  
  // Centralized logs queue - All services → LogConsumer
  LOGS: 'logs.queue',
} as const;

/**
 * Routing Keys for Log Exchange
 */
export const LOG_ROUTING_KEYS = {
  // Format: service.level (e.g., orders.info, payment.error)
  INFO: (service: string) => `${service}.info`,
  ERROR: (service: string) => `${service}.error`,
  WARN: (service: string) => `${service}.warn`,
  ALL: '#', // Subscribe to all logs
} as const;

/**
 * Message Types
 */

// Message sent from OrdersService to PaymentService to process payment
export interface ProcessPaymentMessage {
  correlationId: string;
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
  correlationId: string;
  orderId: string;
  paymentId: string;
  status: 'COMPLETED' | 'FAILED';
  transactionId?: string;
  errorMessage?: string;
}

// Log message sent to centralized logging queue
export interface LogMessage {
  timestamp: string;
  level: 'Info' | 'Error' | 'Warn';
  service: string;
  correlationId: string;
  url: string;
  message: string;
  error?: {
    message: string;
    stack?: string;
  };
}
