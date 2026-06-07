import { Router, Response } from 'express';
import { AuthRequest, authenticate, requireRole } from '../../shared/middleware/auth';

const router = Router();
router.use(authenticate, requireRole('reviewer'));

router.get('/ping', (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { portal: 'reviewer' } });
});

export default router;
