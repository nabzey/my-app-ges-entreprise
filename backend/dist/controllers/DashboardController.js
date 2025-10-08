"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const DashboardService_1 = require("../services/DashboardService");
class DashboardController {
    service = new DashboardService_1.DashboardService();
    async getDashboard(req, res) {
        try {
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            const data = await this.service.getDashboardData(req.user);
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=DashboardController.js.map