import { rabbitMQ } from "./rabbitmq.js";
import type { PaymentResultMessage } from "./types.js";
import { QUEUES } from "./types.js";
import ordersService from "../services/orders.service.js";

/**
 * Message Consumer for OrdersService
 * Listens to payment result messages
 */
class MessageConsumer {
  /**
   * Start consuming messages from payment.result queue
   */
  async startConsumers(): Promise<void> {
    try {
      const channel = rabbitMQ.getChannel();
      
      // Ensure queue exists
      await channel.assertQueue(QUEUES.PAYMENT_RESULT, {
        durable: true,
      });
      
      // Set prefetch to process one message at a time
      await channel.prefetch(1);
      
      console.log(`👂 Listening for messages on [${QUEUES.PAYMENT_RESULT}]`);
      
      // Start consuming
      channel.consume(
        QUEUES.PAYMENT_RESULT,
        async (msg: any) => {
          if (!msg) return;
          
          try {
            const data: PaymentResultMessage = JSON.parse(
              msg.content.toString()
            );
            
            console.log(`📥 Received payment result for order: ${data.orderId}`);
            
            // Handle the payment result
            await this.handlePaymentResult(data);
            
            // Acknowledge message (remove from queue)
            channel.ack(msg);
          } catch (error) {
            console.error("❌ Error processing payment result:", error);
            
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
   * Handle payment result from PaymentService
   */
  private async handlePaymentResult(data: PaymentResultMessage): Promise<void> {
    try {
      // Update order status based on payment result
      if (data.status === 'COMPLETED') {
        // Payment successful - update order to confirmed
        await ordersService.updateOrderStatus(data.orderId, 'confirmed');
        console.log(`✅ Order ${data.orderId} confirmed - Payment successful (${data.transactionId})`);
      } else {
        // Payment failed - update order to cancelled or payment_failed
        await ordersService.updateOrderStatus(data.orderId, 'cancelled');
        console.log(`❌ Order ${data.orderId} cancelled - Payment failed: ${data.errorMessage}`);
      }
    } catch (error) {
      console.error(`❌ Failed to update order ${data.orderId}:`, error);
      throw error;
    }
  }
}

export const messageConsumer = new MessageConsumer();
