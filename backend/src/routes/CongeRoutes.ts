import Router from 'express';
import { CongeController } from '../controllers/CongeController';
import { authenticateToken, requireAdminOrSuperAdmin } from '../middleware/auth';

const cont = new CongeController();
const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les employés (faire une demande de congé, voir ses demandes)
router.post('/request', cont.createCongeRequest.bind(cont));
router.get('/my-requests', cont.getMyCongeRequests.bind(cont));
router.get('/my-requests/:id', cont.getMyCongeRequestById.bind(cont));
router.patch('/my-requests/:id/cancel', cont.cancelCongeRequest.bind(cont));
router.get('/balance', cont.getCongeBalance.bind(cont));

// Routes pour ADMIN ou SUPER_ADMIN (gérer les demandes)
router.get('/', requireAdminOrSuperAdmin, cont.getAllCongeRequests.bind(cont));
router.get('/:id', requireAdminOrSuperAdmin, cont.getCongeRequestById.bind(cont));
router.patch('/:id/approve', requireAdminOrSuperAdmin, cont.approveCongeRequest.bind(cont));
router.patch('/:id/reject', requireAdminOrSuperAdmin, cont.rejectCongeRequest.bind(cont));
router.get('/employee/:employeeId', requireAdminOrSuperAdmin, cont.getCongeRequestsByEmployee.bind(cont));

export default router;