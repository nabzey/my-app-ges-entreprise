"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const client_1 = require("@prisma/client");
class DashboardRepository {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async getKPIs(entrepriseId) {
        // Nombre d'employés actifs
        const activeEmployees = await this.prisma.employee.count({
            where: { actif: true, entrepriseId }
        });
        // Masse salariale totale (somme des tauxSalaire des actifs)
        const totalSalary = await this.prisma.employee.aggregate({
            where: { actif: true, entrepriseId },
            _sum: { tauxSalaire: true }
        });
        // Montant payé (somme des montants des paiements)
        const totalPaid = await this.prisma.payment.aggregate({
            where: {
                payslip: {
                    employee: { entrepriseId }
                }
            },
            _sum: { montant: true }
        });
        // Montant restant (somme des net des payslips non payés)
        const remainingAmount = await this.prisma.payslip.aggregate({
            where: {
                status: { not: 'PAYE' },
                employee: { entrepriseId }
            },
            _sum: { net: true }
        });
        return {
            activeEmployees,
            totalSalary: totalSalary._sum.tauxSalaire || 0,
            totalPaid: totalPaid._sum.montant || 0,
            remainingAmount: remainingAmount._sum.net || 0
        };
    }
    async getSalaryEvolution(entrepriseId) {
        // Évolution de la masse salariale sur 6 derniers mois
        // Supposons que les payruns ont des périodes mensuelles
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const payRuns = await this.prisma.payRun.findMany({
            where: {
                status: 'CLOTURE',
                entrepriseId,
                createdAt: { gte: sixMonthsAgo }
            },
            include: {
                payslips: true
            },
            orderBy: { createdAt: 'asc' }
        });
        // Calculer la masse pour chaque mois
        const evolution = payRuns.map(pr => ({
            month: pr.periode,
            totalSalary: pr.payslips.reduce((sum, p) => sum + Number(p.brut), 0)
        }));
        return evolution;
    }
    async getUpcomingPayments(entrepriseId) {
        // Prochains paiements : payslips avec status EN_ATTENTE ou PARTIEL
        const payslips = await this.prisma.payslip.findMany({
            where: {
                status: { in: ['EN_ATTENTE', 'PARTIEL'] },
                employee: { entrepriseId }
            },
            include: {
                employee: true,
                payRun: true
            },
            orderBy: { createdAt: 'asc' },
            take: 10 // Limiter à 10
        });
        return payslips.map(p => ({
            id: p.id,
            employeeName: p.employee.nom,
            amount: p.net,
            dueDate: p.payRun.periode, // Supposons que periode est la date
            status: p.status
        }));
    }
}
exports.DashboardRepository = DashboardRepository;
//# sourceMappingURL=DashboardRepository.js.map