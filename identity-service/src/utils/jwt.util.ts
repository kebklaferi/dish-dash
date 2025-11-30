import jwt from 'jsonwebtoken';
import { User } from '../models/user.entity';

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (user: User) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
