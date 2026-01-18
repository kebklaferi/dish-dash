import Fastify from 'fastify';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import dotenv from 'dotenv';
import Log from './models/Log.js';

dotenv.config();

const fastify = Fastify({ logger: true });

// MongoDB connection
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/logging_db');
console.log('MongoDB connected');

// POST /logs - consume from RabbitMQ and save to DB
fastify.post('/logs', async (request, reply) => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    const QUEUE_NAME = 'logs_queue';
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    let messageCount = 0;
    let hasMessages = true;

    while (hasMessages) {
      const msg = await channel.get(QUEUE_NAME, { noAck: false });
      
      if (msg) {
        const logData = JSON.parse(msg.content.toString());
        await Log.create(logData);
        channel.ack(msg);
        messageCount++;
      } else {
        hasMessages = false;
      }
    }

    await channel.close();
    await connection.close();

    return {
      success: true,
      message: `Successfully saved ${messageCount} logs`,
      count: messageCount
    };
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Error processing logs',
      error: error.message
    });
  }
});

// GET /logs/:dateFrom/:dateTo
fastify.get('/logs/:dateFrom/:dateTo', async (request, reply) => {
  try {
    const { dateFrom, dateTo } = request.params;
    
    const logs = await Log.find({
      timestamp: {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      }
    }).sort({ timestamp: 1 });

    return {
      success: true,
      count: logs.length,
      logs: logs.map(log => log.fullLog)
    };
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Error fetching logs',
      error: error.message
    });
  }
});

// DELETE /logs
fastify.delete('/logs', async (request, reply) => {
  try {
    const result = await Log.deleteMany({});
    
    return {
      success: true,
      message: 'All logs deleted',
      deletedCount: result.deletedCount
    };
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Error deleting logs',
      error: error.message
    });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3005, host: '0.0.0.0' });
    console.log('LoggingService running on port 3005');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();