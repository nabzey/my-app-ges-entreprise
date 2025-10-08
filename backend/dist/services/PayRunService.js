"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayRunService = void 0;
const PayRunRepository_1 = require("../repositories/PayRunRepository");
const client_1 = require("@prisma/client");
class PayRunService {
    repo = new PayRunRepository_1.PayRunRepository();
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(data, entrepriseId) {
        return await this.repo.create({ ...data, entrepriseId });
    }
    async findAll(entrepriseId) {
        return await this.repo.findAll(entrepriseId);
    }
    async findById(id) {
        return await this.repo.findById(id);
    }
    async updateStatus(id, status, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        // Validation du workflow
        const payRun = await this.repo.findById(id);
        if (!payRun)
            throw new Error('PayRun non trouvé');
        if (payRun.entrepriseId !== entrepriseId) {
            throw new Error('Accès non autorisé à ce cycle de paie');
        }
        // Vérifier les transitions autorisées
        if (payRun.status === 'CLOTURE') {
            throw new Error('PayRun clôturé ne peut plus être modifié');
        }
        if (status === 'BROUILLON' && payRun.status !== 'BROUILLON') {
            throw new Error('Impossible de revenir au statut BROUILLON');
        }
        if (status === 'APPROUVE' && payRun.status !== 'BROUILLON') {
            throw new Error('Seul un PayRun en BROUILLON peut être approuvé');
        }
        if (status === 'CLOTURE' && payRun.status !== 'APPROUVE') {
            throw new Error('Seul un PayRun approuvé peut être clôturé');
        }
        return await this.repo.update(id, { status });
    }
    async approvePayRun(id, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        const payRun = await this.updateStatus(id, 'APPROUVE', user);
        // Mettre à jour le statut des bulletins de paie associés
        await this.prisma.payslip.updateMany({
            where: {
                payRunId: id,
                status: 'EN_ATTENTE',
                employee: { entrepriseId }
            },
            data: { status: 'PARTIEL' } // Ils deviennent partiels car peuvent encore recevoir des paiements
        });
        return payRun;
    }
    async closePayRun(id, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        const payRun = await this.updateStatus(id, 'CLOTURE', user);
        // Finaliser les bulletins de paie - ceux sans paiement deviennent PAYE
        const payslips = await this.prisma.payslip.findMany({
            where: { payRunId: id, employee: { entrepriseId } },
            include: { payments: true }
        });
        for (const payslip of payslips) {
            const totalPaid = payslip.payments.reduce((sum, p) => sum + Number(p.montant), 0);
            if (totalPaid >= Number(payslip.net)) {
                await this.prisma.payslip.update({
                    where: { id: payslip.id },
                    data: { status: 'PAYE' }
                });
            }
            else if (totalPaid > 0) {
                await this.prisma.payslip.update({
                    where: { id: payslip.id },
                    data: { status: 'PARTIEL' }
                });
            }
            else {
                // Si aucun paiement, marquer comme PAYE (cycle clôturé)
                await this.prisma.payslip.update({
                    where: { id: payslip.id },
                    data: { status: 'PAYE' }
                });
            }
        }
        return payRun;
    }
    async getPayRunsByStatus(status, entrepriseId) {
        return await this.repo.findByStatus(status, entrepriseId);
    }
    async getPayRunsByPeriod(year, month, entrepriseId) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        return await this.repo.findByPeriod(startDate, endDate, entrepriseId);
    }
}
exports.PayRunService = PayRunService;
//# sourceMappingURL=PayRunService.js.map