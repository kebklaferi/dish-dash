import { rabbitMQ } from "./rabbitmq.js";
import type { ProcessPaymentMessage } from "./types.js";
import { QUEUES } from "./types.js";

/**
 * Message Publisher
 * Sends messages to RabbitMQ queues
 */
class MessagePublisher {
  /**
   * Publish a message to a queue
   */
  private async publish(queue: string, message: any): Promise<void> {
    try {
      const channel = rabbitMQ.getChannel();
      
      // Ensure queue exists
      await channel.assertQueue(queue, {
        durable: true, // Queue survives RabbitMQ restarts
      });
      
      // Send message
      const sent = channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true, // Message survives RabbitMQ restarts
        }
      );
      
      if (sent) {
        console.log(`📤 Message sent to queue [${queue}]`);
      } else {
        console.warn(`⚠️ Message queued but buffer full [${queue}]`);
      }
    } catch (error) {
      console.error(`❌ Failed to publish to queue [${queue}]:`, error);
      throw error;
    }
  }

  /**
   * Request payment processing
   * OrdersService → PaymentService
   */
  async requestPaymentProcessing(data: ProcessPaymentMessage): Promise<void> {
    console.log(`💳 Requesting payment processing for order: ${data.orderId}`);
    await this.publish(QUEUES.PAYMENT_PROCESS, data);
  }
}

export const messagePublisher = new MessagePublisher();
