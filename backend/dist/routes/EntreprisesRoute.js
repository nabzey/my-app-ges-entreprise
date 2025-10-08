"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EntreprisesController_1 = require("../controllers/EntreprisesController");
const router = (0, express_1.Router)();
router.get('/', EntreprisesController_1.EntreprisesController.listEntreprises);
router.get('/:id/stats', EntreprisesController_1.EntreprisesController.getEntrepriseStats);
exports.default = router;
//# sourceMappingURL=EntreprisesRoute.js.map