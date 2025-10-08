import Router from 'express';
import { EmployeeController } from '../controllers/EmployeeController';
import { authenticateToken, requireAdminOrSuperAdmin, requireAdminOrCaissier } from '../middleware/auth';

const cont = new EmployeeController();
const router = Router();

// Route de connexion publique (pas d'authentification requise)
router.post('/login', cont.login.bind(cont));

// Protéger toutes les routes avec authentification
router.use(authenticateToken);

// Route pour le tableau de bord employé (accessible aux employés)
router.get('/dashboard', cont.getDashboard.bind(cont));

// Routes pour les employés (accessible aux employés connectés)
router.get('/pointages', cont.getMyPointages.bind(cont));
router.get('/payslips', cont.getMyPayslips.bind(cont));
router.get('/payslips/:id/pdf', cont.downloadMyPayslipPdf.bind(cont));

// Note: Les routes ci-dessus sont accessibles aux employés car elles sont après authenticateToken
// mais avant les middlewares restrictifs

// Routes pour ADMIN ou SUPER_ADMIN
router.post('/', requireAdminOrSuperAdmin, cont.create.bind(cont));
router.put('/:id', requireAdminOrSuperAdmin, cont.update.bind(cont));
router.delete('/:id', requireAdminOrSuperAdmin, cont.delete.bind(cont));

// Routes pour ADMIN ou CAISSIER
router.get('/', requireAdminOrCaissier, cont.getAll.bind(cont));
router.get('/:id', requireAdminOrCaissier, cont.getById.bind(cont));
router.patch('/:id/toggle', requireAdminOrSuperAdmin, cont.toggleActif.bind(cont));
router.post('/:id/confirm-code', requireAdminOrCaissier, cont.confirmCode.bind(cont));
router.get('/:id/qr', requireAdminOrCaissier, cont.getQRCode.bind(cont));

export default router;
