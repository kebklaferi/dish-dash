import prisma from "../db/pool.js";
import { rabbitMQ } from "../messaging/rabbitmq.js";
import { QUEUES } from "../messaging/types.js";
import type { LogMessage } from "../messaging/types.js";

/**
 * Logs Service
 * Manages log persistence from RabbitMQ to database
 */
class LogsService {
  /**
   * Save all logs from RabbitMQ queue to database
   * Consumes messages from logs.queue and stores them
   */
  async saveLogsFromQueue(): Promise<{ saved: number; errors: number }> {
    let saved = 0;
    let errors = 0;

    try {
      const channel = rabbitMQ.getChannel();

      // Get queue info to see how many messages are available
      const queueInfo = await channel.checkQueue(QUEUES.LOGS);
      const messageCount = queueInfo.messageCount;

      console.log(`📊 Found ${messageCount} logs in queue`);

      // Process messages one by one
      for (let i = 0; i < messageCount; i++) {
        const msg = await channel.get(QUEUES.LOGS, { noAck: false });

        if (!msg) {
          break; // No more messages
        }

        try {
          const logData: LogMessage = JSON.parse(msg.content.toString());

          // Save to database
          await prisma.orderLog.create({
            data: {
              timestamp: new Date(logData.timestamp),
              level: logData.level,
              service: logData.service,
              correlationId: logData.correlationId,
              url: logData.url,
              message: logData.message,
              errorMessage: logData.error?.message,
              errorStack: logData.error?.stack,
            },
          });

          // Acknowledge message (remove from queue)
          channel.ack(msg);
          saved++;
        } catch (error) {
          console.error("Error saving log:", error);
          // Reject and don't requeue
          channel.nack(msg, false, false);
          errors++;
        }
      }

      console.log(`✅ Saved ${saved} logs to database, ${errors} errors`);
      return { saved, errors };
    } catch (error) {
      console.error("Failed to save logs from queue:", error);
      throw error;
    }
  }

  /**
   * Get logs between dates
   */
  async getLogsBetweenDates(
    startDate: Date,
    endDate: Date,
    level?: string,
    correlationId?: string
  ) {
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (level) {
      where.level = level;
    }

    if (correlationId) {
      where.correlationId = correlationId;
    }

    return await prisma.orderLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Delete all logs from database
   */
  async deleteAllLogs(): Promise<number> {
    const result = await prisma.orderLog.deleteMany({});
    return result.count;
  }
}

export default new LogsService();
