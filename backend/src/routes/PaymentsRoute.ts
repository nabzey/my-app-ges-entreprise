import { Router } from 'express';
import { PaymentsController } from '../controllers/PaymentsController';
import { authenticateToken, requireAdminOrCaissier } from '../middleware/auth';

const router = Router();
const controller = new PaymentsController();

router.post('/', authenticateToken, requireAdminOrCaissier, controller.recordPayment.bind(controller));
router.get('/', authenticateToken, requireAdminOrCaissier, controller.getPayments.bind(controller));
router.get('/:id/receipt', authenticateToken, requireAdminOrCaissier, controller.downloadPaymentReceipt.bind(controller));

export default router;
