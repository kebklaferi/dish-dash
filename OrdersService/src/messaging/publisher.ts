import { rabbitMQ } from "./rabbitmq.js";
import type { ProcessPaymentMessage } from "./types.js";
import { QUEUES } from "./types.js";
import { logger } from "../utils/logger.js";

/**
 * Message Publisher
 * Sends messages to RabbitMQ queues
 */
class MessagePublisher {
  /**
   * Publish a message to a queue
   */
  private async publish(queue: string, message: any, correlationId: string): Promise<void> {
    const context = {
      correlationId,
      url: `queue://${queue}`,
    };

    try {
      // Check if RabbitMQ is connected
      if (!rabbitMQ.isConnected()) {
        logger.error('Cannot publish - RabbitMQ not connected', context);
        throw new Error('RabbitMQ not connected');
      }
      
      const channel = rabbitMQ.getChannel();
      
      // Ensure queue exists
      await channel.assertQueue(queue, {
        durable: true, // Queue survives RabbitMQ restarts
      });
      
      logger.info(`Publishing message to queue [${queue}]`, context);
      
      // Send message
      const sent = channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true, // Message survives RabbitMQ restarts
        }
      );
      
      if (sent) {
        logger.info(`Message successfully sent to queue [${queue}]`, context);
      } else {
        logger.warn(`Message queued but buffer full [${queue}]`, context);
      }
    } catch (error) {
      logger.error(`Failed to publish to queue [${queue}]`, context, error as Error);
      throw error;
    }
  }

  /**
   * Request payment processing
   * OrdersService → PaymentService
   */
  async requestPaymentProcessing(data: Omit<ProcessPaymentMessage, 'correlationId'>): Promise<void> {
    const correlationId = logger.generateCorrelationId();
    const messageWithCorrelation: ProcessPaymentMessage = {
      ...data,
      correlationId,
    };

    logger.info(
      `Requesting payment processing for order: ${data.orderId}, amount: ${data.amount} ${data.currency}`,
      { correlationId, url: `queue://${QUEUES.PAYMENT_PROCESS}` }
    );
    
    await this.publish(QUEUES.PAYMENT_PROCESS, messageWithCorrelation, correlationId);
  }
}

export const messagePublisher = new MessagePublisher();
