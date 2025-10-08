"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DashboardController_1 = require("../controllers/DashboardController");
const auth_1 = require("../middleware/auth");
const cont = new DashboardController_1.DashboardController();
const router = (0, express_1.default)();
router.get('/', auth_1.authenticateToken, auth_1.requireAdminOrCaissier, cont.getDashboard.bind(cont));
exports.default = router;
//# sourceMappingURL=DashboardRoute.js.map