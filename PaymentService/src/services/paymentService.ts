import { prisma } from '../db/prisma.js';
import { PaymentStatus, PaymentMethod } from '../types/payment.js';
import type { CreatePaymentInput } from '../types/schemas.js';

export class PaymentService {
  /**
   * Create a new payment and process it immediately
   */
  async createPayment(data: CreatePaymentInput) {
    const { orderId, amount, currency, paymentMethod, cardNumber, cardholderName } = data;

    // Extract card details (last 4 digits and brand)
    const cardLast4 = cardNumber.slice(-4);
    const cardBrand = this.getCardBrand(cardNumber);

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        currency: currency || 'EUR',
        status: PaymentStatus.PENDING,
        paymentMethod: paymentMethod as PaymentMethod,
        cardLast4,
        cardBrand,
      },
    });

    // Create history entry
    await this.addHistory(payment.id, PaymentStatus.PENDING, 'Payment created');

    // Automatically process the payment
    const result = await this.processPaymentInternal(payment.id);
    
    return result;
  }

  /**
   * Process a payment (simulated card processing)
   * Internal method - called automatically on payment creation
   */
  private async processPaymentInternal(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error(`Payment already ${payment.status.toLowerCase()}`);
    }

    // Update to processing
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.PROCESSING },
    });

    await this.addHistory(paymentId, PaymentStatus.PROCESSING, 'Payment processing started');

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate payment approval (90% success rate)
    const isApproved = Math.random() > 0.1;

    if (isApproved) {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId,
          processedAt: new Date(),
        },
      });

      await this.addHistory(paymentId, PaymentStatus.COMPLETED, 'Payment completed successfully');

      return {
        success: true,
        payment: updatedPayment,
        message: 'Payment processed successfully',
      };
    } else {
      const errorMessage = 'Insufficient funds or card declined';
      
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          errorMessage,
          processedAt: new Date(),
        },
      });

      await this.addHistory(paymentId, PaymentStatus.FAILED, errorMessage);

      return {
        success: false,
        payment: null,
        message: errorMessage,
      };
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string) {
    return await prisma.payment.findUnique({
      where: { id: paymentId },
    });
  }

  /**
   * Get payments by order ID
   */
  async getPaymentsByOrderId(orderId: string) {
    return await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(paymentId: string) {
    return await prisma.paymentHistory.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Add history entry
   */
  private async addHistory(paymentId: string, status: PaymentStatus, message?: string) {
    await prisma.paymentHistory.create({
      data: {
        paymentId,
        status,
        ...(message !== undefined && { message }),
      },
    });
  }

  /**
   * Get card brand from card number
   */
  private getCardBrand(cardNumber: string): string {
    const firstDigit = cardNumber[0];
    const firstTwoDigits = cardNumber.substring(0, 2);

    if (firstDigit === '4') return 'Visa';
    if (['51', '52', '53', '54', '55'].includes(firstTwoDigits)) return 'Mastercard';
    if (['34', '37'].includes(firstTwoDigits)) return 'Amex';
    if (firstTwoDigits === '60') return 'Discover';

    return 'Unknown';
  }

  /**
   * Refund a payment (for future use)
   */
  async refundPayment(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Only completed payments can be refunded');
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        updatedAt: new Date(),
      },
    });

    await this.addHistory(paymentId, PaymentStatus.REFUNDED, 'Payment refunded');

    return updatedPayment;
  }
}

export const paymentService = new PaymentService();
