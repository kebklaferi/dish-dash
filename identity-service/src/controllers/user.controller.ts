import { Request, Response } from 'express';
import * as UserService from '../services/user.service';

/**
 * GET /users/:id
 * Returns user by ID (self or admin, checked in middleware)
 */
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password, ...userData } = user; // exclude password
    res.status(200).json(userData);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /users/me
 * Returns currently logged-in user
 */
export const getCurrentUser = (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /users
 * Returns all users (admin-only, enforced in middleware)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    const sanitizedUsers = users.map(u => {
      const { password, ...data } = u;
      return data;
    });

    res.status(200).json(sanitizedUsers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /users/:id
 * Update user info (self or admin, enforced in middleware)
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await UserService.updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /users/:id/password
 * Update user password (self-only, enforced in middleware)
 */
export const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    const result = await UserService.updateUserPassword(req.params.id, newPassword);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /users/:id
 * Delete user (self or admin, enforced in middleware)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
