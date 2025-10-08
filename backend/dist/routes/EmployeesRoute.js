"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const EmployeeController_1 = require("../controllers/EmployeeController");
const auth_1 = require("../middleware/auth");
const cont = new EmployeeController_1.EmployeeController();
const router = (0, express_1.default)();
// Route de connexion publique (pas d'authentification requise)
router.post('/login', cont.login.bind(cont));
// Protéger toutes les routes avec authentification
router.use(auth_1.authenticateToken);
// Route pour le tableau de bord employé (accessible aux employés)
router.get('/dashboard', cont.getDashboard.bind(cont));
// Routes pour les employés (accessible aux employés connectés)
router.get('/pointages', cont.getMyPointages.bind(cont));
router.get('/payslips', cont.getMyPayslips.bind(cont));
router.get('/payslips/:id/pdf', cont.downloadMyPayslipPdf.bind(cont));
// Note: Les routes ci-dessus sont accessibles aux employés car elles sont après authenticateToken
// mais avant les middlewares restrictifs
// Routes pour ADMIN ou SUPER_ADMIN
router.post('/', auth_1.requireAdminOrSuperAdmin, cont.create.bind(cont));
router.put('/:id', auth_1.requireAdminOrSuperAdmin, cont.update.bind(cont));
router.delete('/:id', auth_1.requireAdminOrSuperAdmin, cont.delete.bind(cont));
// Routes pour ADMIN ou CAISSIER
router.get('/', auth_1.requireAdminOrCaissier, cont.getAll.bind(cont));
router.get('/:id', auth_1.requireAdminOrCaissier, cont.getById.bind(cont));
router.patch('/:id/toggle', auth_1.requireAdminOrSuperAdmin, cont.toggleActif.bind(cont));
router.post('/:id/confirm-code', auth_1.requireAdminOrCaissier, cont.confirmCode.bind(cont));
router.get('/:id/qr', auth_1.requireAdminOrCaissier, cont.getQRCode.bind(cont));
exports.default = router;
//# sourceMappingURL=EmployeesRoute.js.map