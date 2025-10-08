"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PayslipsController_1 = require("../controllers/PayslipsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new PayslipsController_1.PayslipsController();
router.get('/', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, controller.getPayslips.bind(controller));
router.get('/employee/:employeeId', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, controller.getPayslipsByEmployee.bind(controller));
router.get('/pending-count', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, controller.getPendingPayslipsCount.bind(controller));
router.get('/:id/pdf', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, controller.downloadPayslipPdf.bind(controller));
// Route pour les employés - accès à leurs propres bulletins
router.get('/my/:id/pdf', auth_1.authenticateToken, controller.downloadMyPayslipPdf.bind(controller));
exports.default = router;
//# sourceMappingURL=PayslipsRoute.js.map