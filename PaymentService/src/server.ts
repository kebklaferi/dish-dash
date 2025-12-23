import app from './app.js';
import { config } from './config/index.js';
import { connectDB, disconnectDB } from './db/prisma.js';

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`Payment Service running on port ${config.port}`);
      console.log(`API Docs available at http://localhost:${config.port}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
