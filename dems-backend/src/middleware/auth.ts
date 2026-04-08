import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string; email: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, role: true, email: true, status: true } });

    if (!user || user.status === 'deleted' || user.status === 'suspended') {
      res.status(401).json({ error: 'Account not accessible' });
      return;
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
