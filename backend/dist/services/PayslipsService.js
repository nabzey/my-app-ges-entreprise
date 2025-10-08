"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayslipsService = void 0;
const client_1 = require("@prisma/client");
const pdfGenerator_1 = require("../utils/pdfGenerator");
class PayslipsService {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async generatePayslipPdf(payslipId, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        // Vérifier que le payslip appartient à l'entreprise de l'utilisateur
        const payslip = await this.prisma.payslip.findUnique({
            where: { id: payslipId },
            include: { employee: true }
        });
        if (!payslip || payslip.employee.entrepriseId !== entrepriseId) {
            throw new Error('Bulletin de paie non trouvé ou accès non autorisé');
        }
        return await pdfGenerator_1.PDFGenerator.generatePayslipPDF(payslipId, entrepriseId.toString());
    }
    async getPayslips(user, status, payRunId, payRunStatus) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        // Fetch payslips for the user's entreprise
        const where = {
            employee: { entrepriseId }
        };
        if (status) {
            where.status = status;
        }
        if (payRunId) {
            where.payRunId = payRunId;
        }
        if (payRunStatus) {
            where.payRun = { status: payRunStatus };
        }
        return await this.prisma.payslip.findMany({
            where,
            include: {
                employee: true,
                payRun: true,
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getPayslipsByEmployeeId(user, employeeId) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.prisma.payslip.findMany({
            where: {
                employeeId,
                employee: { entrepriseId }
            },
            include: {
                employee: true,
                payRun: true,
                payments: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getPendingPayslipsCount(user) {
        if (user.role === 'SUPER_ADMIN') {
            return 0; // Super admin n'a pas de tenant spécifique
        }
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.prisma.payslip.count({
            where: {
                status: 'EN_ATTENTE',
                employee: { entrepriseId }
            }
        });
    }
    async checkPayslipOwnership(payslipId, employeeId, entrepriseId) {
        const payslip = await this.prisma.payslip.findUnique({
            where: { id: payslipId },
            include: { employee: true }
        });
        return payslip && payslip.employee.entrepriseId === entrepriseId && payslip.employeeId === employeeId;
    }
}
exports.PayslipsService = PayslipsService;
//# sourceMappingURL=PayslipsService.js.map