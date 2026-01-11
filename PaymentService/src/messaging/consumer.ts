import { rabbitMQ } from "./rabbitmq.js";
import type { ProcessPaymentMessage, PaymentResultMessage } from "./types.js";
import { QUEUES } from "./types.js";
import { paymentService } from "../services/paymentService.js";

/**
 * Message Consumer for PaymentService
 * Listens to payment processing requests
 */
class MessageConsumer {
  /**
   * Start consuming messages from payment.process queue
   */
  async startConsumers(): Promise<void> {
    try {
      const channel = rabbitMQ.getChannel();
      
      // Ensure queue exists
      await channel.assertQueue(QUEUES.PAYMENT_PROCESS, {
        durable: true,
      });
      
      // Set prefetch to process one message at a time
      await channel.prefetch(1);
      
      console.log(`👂 Listening for messages on [${QUEUES.PAYMENT_PROCESS}]`);
      
      // Start consuming
      channel.consume(
        QUEUES.PAYMENT_PROCESS,
        async (msg: any) => {
          if (!msg) return;
          
          try {
            const data: ProcessPaymentMessage = JSON.parse(
              msg.content.toString()
            );
            
            console.log(`📥 Received payment request for order: ${data.orderId}`);
            
            // Process the payment
            await this.handlePaymentRequest(data);
            
            // Acknowledge message (remove from queue)
            channel.ack(msg);
          } catch (error) {
            console.error("❌ Error processing payment message:", error);
            
            // Reject message and requeue (will be retried)
            channel.nack(msg, false, true);
          }
        },
        {
          noAck: false, // Manual acknowledgment
        }
      );
    } catch (error) {
      console.error("❌ Failed to start consumer:", error);
      throw error;
    }
  }

  /**
   * Handle payment processing request
   */
  private async handlePaymentRequest(data: ProcessPaymentMessage): Promise<void> {
    try {
      // Call the existing payment service to create and process payment
      const result = await paymentService.createPayment({
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod as any,
        cardNumber: data.cardNumber,
        cardExpiry: data.cardExpiry,
        cardCvv: data.cardCvv,
        cardholderName: data.cardholderName,
      });
      
      // Prepare result message - conditionally add optional fields
      const resultMessage: PaymentResultMessage = {
        orderId: data.orderId,
        paymentId: result.payment?.id || '',
        status: result.success ? 'COMPLETED' : 'FAILED',
      };
      
      // Only add transactionId if it exists
      if (result.payment?.transactionId) {
        resultMessage.transactionId = result.payment.transactionId;
      }
      
      // Only add errorMessage if payment failed
      if (!result.success && result.message) {
        resultMessage.errorMessage = result.message;
      }
      
      // Send result back to OrdersService
      await this.publishResult(resultMessage);
      
      console.log(`✅ Payment processed for order: ${data.orderId} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.error(`❌ Payment processing failed for order ${data.orderId}:`, error);
      
      // Send failure result
      const errorMessage: PaymentResultMessage = {
        orderId: data.orderId,
        paymentId: '',
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
      
      await this.publishResult(errorMessage);
    }
  }

  /**
   * Publish payment result back to OrdersService
   */
  private async publishResult(message: PaymentResultMessage): Promise<void> {
    const channel = rabbitMQ.getChannel();
    
    await channel.assertQueue(QUEUES.PAYMENT_RESULT, {
      durable: true,
    });
    
    channel.sendToQueue(
      QUEUES.PAYMENT_RESULT,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      }
    );
    
    console.log(`📤 Payment result sent for order: ${message.orderId}`);
  }
}

export const messageConsumer = new MessageConsumer();
