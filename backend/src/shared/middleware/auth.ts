import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@mena/types';
import { env } from '../env';

export interface AuthPayload {
  userId: number;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

/** Reads the JWT from the httpOnly cookie (or Bearer header) and attaches req.user. */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const fromCookie = (req as Request & { cookies?: Record<string, string> }).cookies?.['token'];
  const fromHeader = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const token = fromCookie ?? fromHeader;

  if (!token) {
    res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    return;
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
}

/** Restricts a route to one or more portal roles. Use after authenticate(). */
export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { message: 'Forbidden for this portal' } });
      return;
    }
    next();
  };
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}
