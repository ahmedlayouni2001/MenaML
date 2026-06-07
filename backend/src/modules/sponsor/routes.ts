import { Router, Response } from 'express';
import { AuthRequest, authenticate, requireRole } from '../../shared/middleware/auth';

const router = Router();
router.use(authenticate, requireRole('sponsor'));

router.get('/ping', (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { portal: 'sponsor' } });
});

export default router;
