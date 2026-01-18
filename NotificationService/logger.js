import amqp from 'amqplib';

let channel = null;
const EXCHANGE_NAME = 'logs_exchange';
const QUEUE_NAME = 'logs_queue';
const ROUTING_KEY = 'logs';

export async function setupRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672');
    channel = await connection.createChannel();
    
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);
    
    console.log('RabbitMQ connected and configured');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
  }
}

export function logToRabbitMQ(logLevel, url, correlationId, message) {
  if (!channel) {
    console.warn('RabbitMQ channel not available');
    return;
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 23);
  const serviceName = 'NotificationService';
  const logMessage = `${timestamp} ${logLevel} ${url} Correlation: ${correlationId} [${serviceName}] - ${message}`;

  try {
    channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify({
      timestamp,
      logLevel,
      url,
      correlationId,
      serviceName,
      message,
      fullLog: logMessage
    })));
  } catch (error) {
    console.error('Error publishing to RabbitMQ:', error);
  }
}