import { randomUUID } from 'crypto';
import type { LogMessage } from '../messaging/types.js';
import { EXCHANGES, LOG_ROUTING_KEYS } from '../messaging/types.js';

export enum LogLevel {
  INFO = 'Info',
  ERROR = 'Error',
  WARN = 'Warn'
}

interface LogContext {
  correlationId?: string;
  url?: string;
  serviceName?: string;
}

/**
 * Structured logger for OrdersService
 * Format: <timestamp> <LogType> <URL> <CorrelationId> <serviceName> - <message>
 */
class Logger {
  private readonly serviceName: string = 'OrdersService';
  private rabbitMQChannel: any = null;

  /**
   * Set RabbitMQ channel for publishing logs
   */
  setRabbitMQChannel(channel: any): void {
    this.rabbitMQChannel = channel;
  }

  /**
   * Generate a correlation ID
   */
  generateCorrelationId(): string {
    return randomUUID();
  }

  /**
   * Publish log to RabbitMQ
   */
  private async publishToRabbitMQ(logMessage: LogMessage, level: LogLevel): Promise<void> {
    if (!this.rabbitMQChannel) {
      return; // RabbitMQ not available, skip publishing
    }

    try {
      // Generate routing key based on level: service.level (e.g., ordersservice.info)
      let routingKey: string;
      switch (level) {
        case LogLevel.INFO:
          routingKey = LOG_ROUTING_KEYS.INFO(this.serviceName.toLowerCase());
          break;
        case LogLevel.ERROR:
          routingKey = LOG_ROUTING_KEYS.ERROR(this.serviceName.toLowerCase());
          break;
        case LogLevel.WARN:
          routingKey = LOG_ROUTING_KEYS.WARN(this.serviceName.toLowerCase());
          break;
      }

      // Publish to logs exchange
      this.rabbitMQChannel.publish(
        EXCHANGES.LOGS,
        routingKey,
        Buffer.from(JSON.stringify(logMessage)),
        {
          persistent: true,
        }
      );
    } catch (error) {
      // Silently fail - don't let logging errors break the application
      console.error('Failed to publish log to RabbitMQ:', error);
    }
  }

  /**
   * Format and log a message
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const timestamp = new Date().toISOString();
    const correlationId = context?.correlationId || 'N/A';
    const url = context?.url || 'N/A';
    const serviceName = context?.serviceName || this.serviceName;

    const logMessage = `${timestamp} ${level} ${url} ${correlationId} ${serviceName} - ${message}`;

    // Console output
    switch (level) {
      case LogLevel.INFO:
        console.log(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        if (error) {
          console.error(`${timestamp} ${level} ${url} ${correlationId} ${serviceName} - Error stack:`, error.stack);
        }
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
    }

    // Publish to RabbitMQ
    const rabbitMQLogMessage: LogMessage = {
      timestamp,
      level,
      service: serviceName,
      correlationId,
      url,
      message,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    this.publishToRabbitMQ(rabbitMQLogMessage, level);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }
}

export const logger = new Logger();
