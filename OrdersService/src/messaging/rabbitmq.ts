import amqp from "amqplib";
import { EXCHANGES, QUEUES, LOG_ROUTING_KEYS } from "./types.js";

/**
 * RabbitMQ Connection Manager
 * Handles connection, channel creation, and reconnection logic
 */
class RabbitMQConnection {
  private connection: any = null;
  private channel: any = null;
  private readonly url: string;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // RabbitMQ connection URL from environment or default
    this.url = process.env.RABBITMQ_URL || "amqp://admin:admin123@rabbitmq:5672";
  }

  /**
   * Connect to RabbitMQ and create a channel
   */
  async connect(): Promise<void> {
    try {
      console.log("🔌 Connecting to RabbitMQ...");
      
      // Create connection
      this.connection = await amqp.connect(this.url);
      
      // Create channel
      this.channel = await this.connection.createChannel();
      
      console.log("✅ Connected to RabbitMQ");

      // Set up exchanges and queues
      await this.setupInfrastructure();

      // Handle connection events
      this.connection.on("error", (err: Error) => {
        console.error("❌ RabbitMQ connection error:", err.message);
        this.handleDisconnect();
      });

      this.connection.on("close", () => {
        console.warn("⚠️ RabbitMQ connection closed");
        this.handleDisconnect();
      });

    } catch (error) {
      console.error("❌ Failed to connect to RabbitMQ:", error);
      this.handleDisconnect();
    }
  }

  /**
   * Set up exchanges, queues, and bindings
   */
  private async setupInfrastructure(): Promise<void> {
    try {
      // Create logs exchange (topic exchange for routing logs by service and level)
      await this.channel.assertExchange(EXCHANGES.LOGS, 'topic', {
        durable: true, // Exchange survives RabbitMQ restarts
      });
      console.log(`📊 Created/verified exchange: ${EXCHANGES.LOGS}`);

      // Create centralized logs queue
      await this.channel.assertQueue(QUEUES.LOGS, {
        durable: true, // Queue survives RabbitMQ restarts
      });
      console.log(`📥 Created/verified queue: ${QUEUES.LOGS}`);

      // Bind logs queue to logs exchange (subscribe to all logs)
      await this.channel.bindQueue(
        QUEUES.LOGS,
        EXCHANGES.LOGS,
        LOG_ROUTING_KEYS.ALL // '#' wildcard matches all routing keys
      );
      console.log(`🔗 Bound ${QUEUES.LOGS} to ${EXCHANGES.LOGS} with pattern: ${LOG_ROUTING_KEYS.ALL}`);

    } catch (error) {
      console.error("❌ Failed to set up RabbitMQ infrastructure:", error);
      throw error;
    }
  }

  /**
   * Handle disconnection and attempt reconnection
   */
  private handleDisconnect(): void {
    this.connection = null;
    this.channel = null;

    // Clear existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Attempt reconnection after 5 seconds
    console.log("🔄 Attempting to reconnect in 5 seconds...");
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  /**
   * Get the current channel
   * Throws error if not connected
   */
  getChannel(): any {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not available. Connection may be lost.");
    }
    return this.channel;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  /**
   * Close connection gracefully
   */
  async close(): Promise<void> {
    try {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
      if (this.channel) {
        await this.channel.close();
      }
      
      if (this.connection) {
        await this.connection.close();
      }
      
      console.log("✅ RabbitMQ connection closed");
    } catch (error) {
      console.error("Error closing RabbitMQ connection:", error);
    }
  }
}

// Export singleton instance
export const rabbitMQ = new RabbitMQConnection();
