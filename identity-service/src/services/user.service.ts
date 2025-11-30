import { AppDataSource } from '../config/database';
import { User } from '../models/user.entity';
import bcrypt from 'bcrypt';

const userRepository = AppDataSource.getRepository(User);

export const getUserById = async (id: string) => {
  return userRepository.findOneBy({ id });
};

export const getAllUsers = async () => {
  return userRepository.find();
};

export const updateUser = async (id: string, data: Partial<User>) => {
  const user = await userRepository.findOneBy({ id });
  if (!user) throw new Error('User not found');

  Object.assign(user, data);
  await userRepository.save(user);
  const { password, ...userData } = user; // exclude password
  return userData;
};

export const updateUserPassword = async (id: string, newPassword: string) => {
  const user = await userRepository.findOneBy({ id });
  if (!user) throw new Error('User not found');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await userRepository.save(user);
  return { message: 'Password updated successfully' };
};

export const deleteUser = async (id: string) => {
  const user = await userRepository.findOneBy({ id });
  if (!user) throw new Error('User not found');

  await userRepository.remove(user);
  return { message: 'User deleted successfully' };
};