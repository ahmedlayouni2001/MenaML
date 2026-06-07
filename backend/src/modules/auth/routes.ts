import { Router, Response } from 'express';
import { AuthRequest, authenticate, signToken } from '../../shared/middleware/auth';
import { env } from '../../shared/env';
import type { Role } from '@mena/types';

const router = Router();

/**
 * POST /api/auth/login
 * Stub: validate against the users table here. Issues an httpOnly cookie scoped
 * to COOKIE_DOMAIN so every *.mena.ml portal shares the session (SSO).
 */
router.post('/login', async (req: AuthRequest, res: Response) => {
  const { email, password, role } = req.body as { email?: string; password?: string; role?: Role };
  if (!email || !password || !role) {
    return res.status(400).json({ success: false, error: { message: 'email, password, role required' } });
  }

  // TODO(Jawher): look up user, verify bcrypt hash, confirm the user owns `role`.
  const token = signToken({ userId: 1, role });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
    domain: env.cookieDomain,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.json({ success: true, data: { user: { id: 1, email, role } } });
});

router.post('/logout', (_req: AuthRequest, res: Response) => {
  res.clearCookie('token', { domain: env.cookieDomain });
  res.json({ success: true, data: { loggedOut: true } });
});

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
});

export default router;
