import type { Request, Response, NextFunction } from "express";

/**
 * Admin authorization middleware
 * Must be used AFTER authMiddleware
 * Checks if authenticated user has ADMIN role
 */
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({ 
      error: "Access denied. Admin privileges required." 
    });
    return;
  }

  next();
};
