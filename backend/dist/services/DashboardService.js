"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const DashboardRepository_1 = require("../repositories/DashboardRepository");
class DashboardService {
    repo = new DashboardRepository_1.DashboardRepository();
    async getDashboardData(user) {
        let entrepriseId = user.entrepriseId;
        // Handle case where entrepriseId might be a string (from JWT)
        if (typeof entrepriseId === 'string') {
            entrepriseId = parseInt(entrepriseId);
        }
        if (!entrepriseId || isNaN(entrepriseId)) {
            throw new Error('Entreprise non sélectionnée');
        }
        const kpis = await this.repo.getKPIs(entrepriseId);
        const salaryEvolution = await this.repo.getSalaryEvolution(entrepriseId);
        const upcomingPayments = await this.repo.getUpcomingPayments(entrepriseId);
        return {
            kpis,
            salaryEvolution,
            upcomingPayments
        };
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=DashboardService.js.map