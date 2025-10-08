"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentsController_1 = require("../controllers/PaymentsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new PaymentsController_1.PaymentsController();
router.post('/', auth_1.authenticateToken, auth_1.requireAdminOrCaissier, controller.recordPayment.bind(controller));
router.get('/', auth_1.authenticateToken, auth_1.requireAdminOrCaissier, controller.getPayments.bind(controller));
router.get('/:id/receipt', auth_1.authenticateToken, auth_1.requireAdminOrCaissier, controller.downloadPaymentReceipt.bind(controller));
exports.default = router;
//# sourceMappingURL=PaymentsRoute.js.map