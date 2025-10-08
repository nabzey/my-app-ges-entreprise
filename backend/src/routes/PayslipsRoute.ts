import { Router } from 'express';
import { PayslipsController } from '../controllers/PayslipsController';
import { authenticateToken, requireAdminOrSuperAdmin } from '../middleware/auth';

const router = Router();
const controller = new PayslipsController();

router.get('/', authenticateToken, requireAdminOrSuperAdmin, controller.getPayslips.bind(controller));
router.get('/employee/:employeeId', authenticateToken, requireAdminOrSuperAdmin, controller.getPayslipsByEmployee.bind(controller));
router.get('/pending-count', authenticateToken, requireAdminOrSuperAdmin, controller.getPendingPayslipsCount.bind(controller));
router.get('/:id/pdf', authenticateToken, requireAdminOrSuperAdmin, controller.downloadPayslipPdf.bind(controller));

// Route pour les employés - accès à leurs propres bulletins
router.get('/my/:id/pdf', authenticateToken, controller.downloadMyPayslipPdf.bind(controller));

export default router;
