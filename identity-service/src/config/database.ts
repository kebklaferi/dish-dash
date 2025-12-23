import { DataSource } from 'typeorm';
import { User } from '../models/user.entity';
import dotenv from 'dotenv';

// TODO fix migrations
dotenv.config();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User],
  // migrations: [__dirname + '/../migrations/**/*{.js,.ts}'],
  subscribers: [],
});
