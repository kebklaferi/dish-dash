import { Request, Response, NextFunction } from 'express';

export const authorize = (roles: string[] = [], selfCheck: boolean = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user; // set by authentication.middleware
    const resourceId = req.params.id;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Allow if user role is in allowed roles
    if (roles.includes(user.role)) return next();

    // Allow if selfCheck is true and user accesses their own resource
    if (selfCheck && user.id === resourceId) return next();

    // Otherwise forbidden
    return res.status(403).json({ message: 'Forbidden' });
  };
};
