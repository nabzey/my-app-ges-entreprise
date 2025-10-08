"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PointageController_1 = require("../controllers/PointageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new PointageController_1.PointageController();
// Route publique pour le pointage des employés (pas d'authentification requise)
router.post('/employee', controller.createEmployeePointage.bind(controller));
// Protéger les autres routes avec authentification
router.use(auth_1.authenticateToken);
// Routes pour ADMIN ou CAISSIER
router.post('/', auth_1.requireAdminOrCaissier, controller.create.bind(controller));
router.get('/', auth_1.requireAdminOrCaissier, controller.getAll.bind(controller));
router.get('/last-pointage-times', auth_1.requireAdminOrCaissier, controller.getLastPointageTimeForEmployees.bind(controller));
router.get('/employee/:employeeId/date/:date', auth_1.requireAdminOrCaissier, controller.getByEmployeeAndDate.bind(controller));
router.get('/employee/:employeeId/worked-hours/:month/:year', auth_1.requireAdminOrCaissier, controller.getWorkedHours.bind(controller));
router.get('/employee/:employeeId/attendance/:month/:year', auth_1.requireAdminOrCaissier, controller.getAttendanceSummary.bind(controller));
router.get('/attendance', auth_1.requireAdminOrCaissier, controller.getAttendance.bind(controller));
router.post('/attendance/mark-absences', auth_1.requireAdminOrCaissier, controller.markAbsences.bind(controller));
router.get('/:id', auth_1.requireAdminOrCaissier, controller.getById.bind(controller));
router.put('/:id', auth_1.requireAdminOrCaissier, controller.update.bind(controller));
router.delete('/:id', auth_1.requireAdminOrCaissier, controller.delete.bind(controller));
exports.default = router;
//# sourceMappingURL=PointageRoute.js.map