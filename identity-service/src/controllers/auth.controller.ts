import { Request, Response } from 'express';
import * as AuthService from '../services/auth.services';

// POST /auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    const token = await AuthService.registerUser(email, password, username);
    res.status(201).json({ token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const token = await AuthService.loginUser(email, password);
    res.status(200).json({ token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
