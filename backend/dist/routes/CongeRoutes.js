"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CongeController_1 = require("../controllers/CongeController");
const auth_1 = require("../middleware/auth");
const cont = new CongeController_1.CongeController();
const router = (0, express_1.default)();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticateToken);
// Routes pour les employés (faire une demande de congé, voir ses demandes)
router.post('/request', cont.createCongeRequest.bind(cont));
router.get('/my-requests', cont.getMyCongeRequests.bind(cont));
router.get('/my-requests/:id', cont.getMyCongeRequestById.bind(cont));
router.patch('/my-requests/:id/cancel', cont.cancelCongeRequest.bind(cont));
router.get('/balance', cont.getCongeBalance.bind(cont));
// Routes pour ADMIN ou SUPER_ADMIN (gérer les demandes)
router.get('/', auth_1.requireAdminOrSuperAdmin, cont.getAllCongeRequests.bind(cont));
router.get('/:id', auth_1.requireAdminOrSuperAdmin, cont.getCongeRequestById.bind(cont));
router.patch('/:id/approve', auth_1.requireAdminOrSuperAdmin, cont.approveCongeRequest.bind(cont));
router.patch('/:id/reject', auth_1.requireAdminOrSuperAdmin, cont.rejectCongeRequest.bind(cont));
router.get('/employee/:employeeId', auth_1.requireAdminOrSuperAdmin, cont.getCongeRequestsByEmployee.bind(cont));
exports.default = router;
//# sourceMappingURL=CongeRoutes.js.map