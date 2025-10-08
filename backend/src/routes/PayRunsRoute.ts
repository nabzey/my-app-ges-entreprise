import { Router } from 'express';
import { PayRunsController } from '../controllers/PayRunsController';
import { authenticateToken, requireAdminOrSuperAdmin } from '../middleware/auth';

const router = Router();
const controller = new PayRunsController();

router.post('/', authenticateToken, requireAdminOrSuperAdmin, controller.generateMonthlyPayRuns.bind(controller));
router.get('/', authenticateToken, requireAdminOrSuperAdmin, controller.getPayRuns.bind(controller));
router.patch('/:id/approve', authenticateToken, requireAdminOrSuperAdmin, controller.approvePayRun.bind(controller));
router.patch('/:id/close', authenticateToken, requireAdminOrSuperAdmin, controller.closePayRun.bind(controller));

export default router;
