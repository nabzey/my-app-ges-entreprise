import { Router } from 'express';
import { PointageController } from '../controllers/PointageController';
import { authenticateToken, requireAdminOrCaissier } from '../middleware/auth';

const router = Router();
const controller = new PointageController();

// Route publique pour le pointage des employés (pas d'authentification requise)
router.post('/employee', controller.createEmployeePointage.bind(controller));

// Protéger les autres routes avec authentification
router.use(authenticateToken);

// Routes pour ADMIN ou CAISSIER
router.post('/', requireAdminOrCaissier, controller.create.bind(controller));
router.get('/', requireAdminOrCaissier, controller.getAll.bind(controller));
router.get('/last-pointage-times', requireAdminOrCaissier, controller.getLastPointageTimeForEmployees.bind(controller));
router.get('/employee/:employeeId/date/:date', requireAdminOrCaissier, controller.getByEmployeeAndDate.bind(controller));
router.get('/employee/:employeeId/worked-hours/:month/:year', requireAdminOrCaissier, controller.getWorkedHours.bind(controller));
router.get('/employee/:employeeId/attendance/:month/:year', requireAdminOrCaissier, controller.getAttendanceSummary.bind(controller));
router.get('/attendance', requireAdminOrCaissier, controller.getAttendance.bind(controller));
router.post('/attendance/mark-absences', requireAdminOrCaissier, controller.markAbsences.bind(controller));
router.get('/:id', requireAdminOrCaissier, controller.getById.bind(controller));
router.put('/:id', requireAdminOrCaissier, controller.update.bind(controller));
router.delete('/:id', requireAdminOrCaissier, controller.delete.bind(controller));

export default router;