import { rabbitMQ } from "./rabbitmq.js";
import type { ProcessPaymentMessage, PaymentResultMessage } from "./types.js";
import { QUEUES } from "./types.js";
import { paymentService } from "../services/paymentService.js";
import { logger } from "../utils/logger.js";

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
      
      logger.info(`Started listening for messages on queue [${QUEUES.PAYMENT_PROCESS}]`, {
        url: `queue://${QUEUES.PAYMENT_PROCESS}`,
      });
      
      // Start consuming
      channel.consume(
        QUEUES.PAYMENT_PROCESS,
        async (msg: any) => {
          if (!msg) return;
          
          let correlationId = 'N/A';
          
          try {
            const data: ProcessPaymentMessage = JSON.parse(
              msg.content.toString()
            );
            
            correlationId = data.correlationId || 'N/A';
            const context = {
              correlationId,
              url: `queue://${QUEUES.PAYMENT_PROCESS}`,
            };
            
            logger.info(
              `Received payment request for order: ${data.orderId}, amount: ${data.amount} ${data.currency}`,
              context
            );
            
            // Process the payment
            await this.handlePaymentRequest(data);
            
            // Acknowledge message (remove from queue)
            channel.ack(msg);
            
            logger.info(
              `Successfully processed payment request for order: ${data.orderId}`,
              context
            );
          } catch (error) {
            logger.error(
              'Error processing payment message',
              { correlationId, url: `queue://${QUEUES.PAYMENT_PROCESS}` },
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
        { url: `queue://${QUEUES.PAYMENT_PROCESS}` },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Handle payment processing request
   */
  private async handlePaymentRequest(data: ProcessPaymentMessage): Promise<void> {
    const context = {
      correlationId: data.correlationId,
      url: `order://${data.orderId}`,
    };

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
        correlationId: data.correlationId,
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
      
      logger.info(
        `Payment processed for order: ${data.orderId} - ${result.success ? 'SUCCESS' : 'FAILED'}${result.payment?.transactionId ? ` (Transaction: ${result.payment.transactionId})` : ''}`,
        context
      );
    } catch (error) {
      logger.error(`Payment processing failed for order ${data.orderId}`, context, error as Error);
      
      // Send failure result
      const errorMessage: PaymentResultMessage = {
        correlationId: data.correlationId,
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
    const context = {
      correlationId: message.correlationId,
      url: `queue://${QUEUES.PAYMENT_RESULT}`,
    };

    try {
      // Check if RabbitMQ is connected
      if (!rabbitMQ.isConnected()) {
        logger.error('Cannot publish result - RabbitMQ not connected', context);
        throw new Error('RabbitMQ not connected');
      }
      
      const channel = rabbitMQ.getChannel();
      
      await channel.assertQueue(QUEUES.PAYMENT_RESULT, {
        durable: true,
      });
      
      logger.info(`Publishing payment result for order: ${message.orderId}`, context);
      
      const sent = channel.sendToQueue(
        QUEUES.PAYMENT_RESULT,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
        }
      );
      
      if (sent) {
        logger.info(`Payment result successfully sent for order: ${message.orderId}`, context);
      } else {
        logger.warn(`Payment result queued but buffer full for order: ${message.orderId}`, context);
      }
    } catch (error) {
      logger.error('Failed to publish payment result', context, error as Error);
      throw error;
    }
  }
}

export const messageConsumer = new MessageConsumer();
