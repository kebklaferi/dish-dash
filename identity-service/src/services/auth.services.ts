import { AppDataSource } from '../config/database';
import { User } from '../models/user.entity';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.util';

const userRepository = AppDataSource.getRepository(User);

export const registerUser = async (email: string, password: string, username: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = userRepository.create({ email, password: hashedPassword, username });
  await userRepository.save(user);
  return generateToken(user);
};

export const loginUser = async (email: string, password: string) => {
  const user = await userRepository.findOneBy({ email });
  if (!user) throw new Error('User not found');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid password');

  return generateToken(user);
};

