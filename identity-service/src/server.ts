// src/server.ts
import app from './app';
import { AppDataSource } from './config/database';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Error during Data Source initialization', err);
  }
}

main();
