import app from "./app.js";
import { rabbitMQ } from "./messaging/rabbitmq.js";
import { messageConsumer } from "./messaging/consumer.js";

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to RabbitMQ
    await rabbitMQ.connect();
    
    // Start consuming messages
    await messageConsumer.startConsumers();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`Orders service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing RabbitMQ connection');
  await rabbitMQ.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing RabbitMQ connection');
  await rabbitMQ.close();
  process.exit(0);
});

startServer();