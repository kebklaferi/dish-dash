import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/user.entity';

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (user: User) => {
  return jwt.sign(
    { 
      sub: user.id, 
      name: user.username,
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '1h' }  // iat, exp, exp will be set automatically
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
