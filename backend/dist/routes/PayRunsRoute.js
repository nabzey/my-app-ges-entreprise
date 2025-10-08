"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PayRunsController_1 = require("../controllers/PayRunsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new PayRunsController_1.PayRunsController();
router.post('/', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, controller.generateMonthlyPayRuns.bind(controller));
router.get('/', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, controller.getPayRuns.bind(controller));
router.patch('/:id/approve', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, controller.approvePayRun.bind(controller));
router.patch('/:id/close', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, controller.closePayRun.bind(controller));
exports.default = router;
//# sourceMappingURL=PayRunsRoute.js.map