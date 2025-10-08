"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UsersController_1 = require("../controllers/UsersController");
const auth_1 = require("../middleware/auth");
const cont = new UsersController_1.UsersController();
const router = (0, express_1.Router)();
router.post('/auth', cont.login.bind(cont));
router.post('/', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, cont.createUser.bind(cont));
router.post('/entreprises', auth_1.authenticateToken, auth_1.requireSuperAdmin, cont.createEntreprise.bind(cont));
router.get('/entreprises', auth_1.authenticateToken, auth_1.requireSuperAdmin, cont.getEntreprises.bind(cont));
router.get('/stats', auth_1.authenticateToken, auth_1.requireSuperAdmin, cont.getGlobalStats.bind(cont));
router.post('/entreprises/:id/init', auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, cont.initEntrepriseData.bind(cont));
router.post('/entreprises/:id/impersonate', auth_1.authenticateToken, auth_1.requireSuperAdmin, cont.impersonateEntreprise.bind(cont));
router.get('/entreprise/:id/utilisateurs', auth_1.authenticateToken, cont.getAdminsAndCaissiers.bind(cont));
router.get('/entreprise/:id/personnel', auth_1.authenticateToken, cont.getEntreprisePersonnel.bind(cont));
router.get('/entreprises/:entrepriseId/utilisateurs', auth_1.authenticateToken, cont.getUsersByEntreprise.bind(cont));
// New route to change user role
router.post('/change-role', auth_1.authenticateToken, cont.changeUserRole.bind(cont));
exports.default = router;
//# sourceMappingURL=UsersRoute.js.map