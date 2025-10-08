"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayRunsService = void 0;
const client_1 = require("@prisma/client");
const PointageService_1 = require("./PointageService");
class PayRunsService {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async generateMonthlyPayRuns(period, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        const periode = new Date(period + '-01'); // Assume period is YYYY-MM
        // Check if payrun already exists for this period and entreprise
        const existingPayRun = await this.prisma.payRun.findFirst({
            where: { periode, entrepriseId }
        });
        if (existingPayRun) {
            throw new Error('Un cycle de paie existe déjà pour cette période');
        }
        // Create payrun
        const payRun = await this.prisma.payRun.create({
            data: { periode, type: 'MENSUEL', status: 'APPROUVE', entrepriseId }
        });
        // Get all employees for this entreprise
        const employees = await this.prisma.employee.findMany({
            where: { entrepriseId, actif: true }
        });
        // Create payslips for each employee
        const payslips = [];
        const pointageService = new PointageService_1.PointageService();
        for (const emp of employees) {
            // Check if payslip already exists for this employee in this period
            const existingPayslip = await this.prisma.payslip.findFirst({
                where: {
                    employeeId: emp.id,
                    payRun: {
                        periode: {
                            gte: new Date(periode.getFullYear(), periode.getMonth(), 1),
                            lt: new Date(periode.getFullYear(), periode.getMonth() + 1, 1)
                        },
                        entrepriseId
                    }
                }
            });
            if (existingPayslip) {
                // Skip this employee if they already have a payslip for this month
                continue;
            }
            let brut = 0;
            let heuresTravaillees = 0;
            // Calculate salary based on contract type and actual worked hours from pointages
            switch (emp.typeContrat) {
                case 'FIXE':
                    // Fixed monthly salary - always full salary regardless of hours
                    brut = Number(emp.tauxSalaire);
                    // Still calculate worked hours for reporting
                    try {
                        heuresTravaillees = await pointageService.calculateWorkedHours(emp.id, periode.getMonth() + 1, periode.getFullYear(), user);
                    }
                    catch (error) {
                        // If no pointages, assume standard hours
                        heuresTravaillees = 160; // 8 hours × 20 working days
                    }
                    break;
                case 'JOURNALIER':
                    // Daily rate × actual worked days (from pointages)
                    try {
                        heuresTravaillees = await pointageService.calculateWorkedHours(emp.id, periode.getMonth() + 1, periode.getFullYear(), user);
                        // Convert hours to days (assuming 8 hours per day)
                        const joursTravaillees = Math.round(heuresTravaillees / 8);
                        brut = Number(emp.tauxSalaire) * joursTravaillees;
                    }
                    catch (error) {
                        // Fallback to manual entry if no pointages
                        const joursTravaillees = emp.joursTravailles || 0;
                        brut = Number(emp.tauxSalaire) * joursTravaillees;
                        heuresTravaillees = joursTravaillees * 8;
                    }
                    break;
                case 'HONORAIRE':
                    // Hourly rate × actual worked hours from pointages
                    try {
                        heuresTravaillees = await pointageService.calculateWorkedHours(emp.id, periode.getMonth() + 1, periode.getFullYear(), user);
                        brut = Number(emp.tauxSalaire) * heuresTravaillees;
                    }
                    catch (error) {
                        // Fallback to manual entry if no pointages
                        const joursHonoraire = emp.joursTravailles || 0;
                        heuresTravaillees = joursHonoraire * 8; // Assume 8 hours per day
                        brut = Number(emp.tauxSalaire) * heuresTravaillees;
                    }
                    break;
                default:
                    // Default to fixed salary
                    brut = Number(emp.tauxSalaire);
                    heuresTravaillees = 160; // Standard assumption
                    break;
            }
            const deductions = 0; // Placeholder for future deductions logic
            const net = brut - deductions;
            const payslip = await this.prisma.payslip.create({
                data: {
                    employeeId: emp.id,
                    payRunId: payRun.id,
                    brut,
                    deductions,
                    net,
                }
            });
            payslips.push(payslip);
        }
        return { payRun, payslips, count: payslips.length };
    }
    async getPayRuns(user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.prisma.payRun.findMany({
            where: { entrepriseId },
            include: {
                payslips: {
                    include: {
                        employee: true,
                        payments: true,
                    }
                }
            },
            orderBy: { periode: 'desc' }
        });
    }
    async approvePayRun(payRunId, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        const payRun = await this.prisma.payRun.findUnique({
            where: { id: payRunId }
        });
        if (!payRun) {
            throw new Error('Cycle de paie non trouvé');
        }
        if (payRun.entrepriseId !== entrepriseId) {
            throw new Error('Accès non autorisé à ce cycle de paie');
        }
        if (payRun.status !== 'BROUILLON') {
            throw new Error('Seuls les cycles en brouillon peuvent être approuvés');
        }
        return await this.prisma.payRun.update({
            where: { id: payRunId },
            data: { status: 'APPROUVE' }
        });
    }
    async closePayRun(payRunId, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        const payRun = await this.prisma.payRun.findUnique({
            where: { id: payRunId },
            include: { payslips: true }
        });
        if (!payRun) {
            throw new Error('Cycle de paie non trouvé');
        }
        if (payRun.entrepriseId !== entrepriseId) {
            throw new Error('Accès non autorisé à ce cycle de paie');
        }
        if (payRun.status !== 'APPROUVE') {
            throw new Error('Seuls les cycles approuvés peuvent être clôturés');
        }
        // Check if all payslips are paid
        const unpaidPayslips = payRun.payslips.filter((p) => p.status !== 'PAYE');
        if (unpaidPayslips.length > 0) {
            throw new Error('Tous les bulletins doivent être payés avant de clôturer le cycle');
        }
        return await this.prisma.payRun.update({
            where: { id: payRunId },
            data: { status: 'CLOTURE' }
        });
    }
}
exports.PayRunsService = PayRunsService;
//# sourceMappingURL=PayRunsService.js.map