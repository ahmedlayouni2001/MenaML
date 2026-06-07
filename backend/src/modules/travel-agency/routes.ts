import { Router, Response } from 'express';
import { AuthRequest, authenticate, requireRole } from '../../shared/middleware/auth';

const router = Router();
router.use(authenticate, requireRole('agency'));

router.get('/ping', (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { portal: 'travel-agency' } });
});

// TODO: migrate the prototype's travelers / groups / tickets / transactions routes here.

export default router;
