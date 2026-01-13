import { rabbitMQ } from "./rabbitmq.js";
import type { PaymentResultMessage } from "./types.js";
import { QUEUES } from "./types.js";
import ordersService from "../services/orders.service.js";
import { logger } from "../utils/logger.js";

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
      
      logger.info(`Started listening for messages on queue [${QUEUES.PAYMENT_RESULT}]`, {
        url: `queue://${QUEUES.PAYMENT_RESULT}`,
      });
      
      // Start consuming
      channel.consume(
        QUEUES.PAYMENT_RESULT,
        async (msg: any) => {
          if (!msg) return;
          
          let correlationId = 'N/A';
          
          try {
            const data: PaymentResultMessage = JSON.parse(
              msg.content.toString()
            );
            
            correlationId = data.correlationId || 'N/A';
            const context = {
              correlationId,
              url: `queue://${QUEUES.PAYMENT_RESULT}`,
            };
            
            logger.info(
              `Received payment result for order: ${data.orderId}, status: ${data.status}`,
              context
            );
            
            // Handle the payment result
            await this.handlePaymentResult(data);
            
            // Acknowledge message (remove from queue)
            channel.ack(msg);
            
            logger.info(
              `Successfully processed payment result for order: ${data.orderId}`,
              context
            );
          } catch (error) {
            logger.error(
              'Error processing payment result message',
              { correlationId, url: `queue://${QUEUES.PAYMENT_RESULT}` },
              error as Error
            );
            
            // Reject message and requeue (will be retried)
            channel.nack(msg, false, true);
          }
        },
        {
          noAck: false, // Manual acknowledgment
        }
      );
    } catch (error) {
      logger.error(
        'Failed to start consumer',
        { url: `queue://${QUEUES.PAYMENT_RESULT}` },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Handle payment result from PaymentService
   */
  private async handlePaymentResult(data: PaymentResultMessage): Promise<void> {
    const context = {
      correlationId: data.correlationId,
      url: `order://${data.orderId}`,
    };

    try {
      // Update order status based on payment result
      if (data.status === 'COMPLETED') {
        // Payment successful - update order to confirmed
        await ordersService.updateOrderStatus(data.orderId, 'confirmed');
        logger.info(
          `Order ${data.orderId} confirmed - Payment successful (Transaction: ${data.transactionId})`,
          context
        );
      } else {
        // Payment failed - update order to cancelled or payment_failed
        await ordersService.updateOrderStatus(data.orderId, 'cancelled');
        logger.error(
          `Order ${data.orderId} cancelled - Payment failed: ${data.errorMessage || 'Unknown error'}`,
          context
        );
      }
    } catch (error) {
      logger.error(`Failed to update order ${data.orderId}`, context, error as Error);
      throw error;
    }
  }
}

export const messageConsumer = new MessageConsumer();
