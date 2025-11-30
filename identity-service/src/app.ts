import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { setupSwagger } from './swagger';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/auth', authRoutes)
app.use('/users', userRoutes);
setupSwagger(app);

export default app;
