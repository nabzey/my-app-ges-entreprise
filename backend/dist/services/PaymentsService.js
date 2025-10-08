"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const client_1 = require("@prisma/client");
const pdfGenerator_1 = require("../utils/pdfGenerator");
class PaymentsService {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async recordPayment(paymentData, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        const { payslipId, montant, mode, date } = paymentData;
        // Create payment
        const payment = await this.prisma.payment.create({
            data: {
                payslipId,
                montant: Number(montant),
                mode,
                date: new Date(date),
            },
        });
        // Get payslip
        const payslip = await this.prisma.payslip.findUnique({
            where: { id: payslipId },
            include: { payments: true, employee: true },
        });
        if (!payslip) {
            throw new Error('Bulletin de paie non trouvé');
        }
        if (payslip.employee.entrepriseId !== entrepriseId) {
            throw new Error('Accès non autorisé à ce bulletin de paie');
        }
        // Calculate current total paid (before this payment)
        const currentTotalPaid = payslip.payments.reduce((sum, p) => sum + Number(p.montant), 0);
        // Validate payment amount doesn't exceed remaining balance
        const remainingAmount = Number(payslip.net) - currentTotalPaid;
        if (Number(montant) > remainingAmount) {
            throw new Error(`Montant du paiement (${Number(montant).toLocaleString()} XOF) dépasse le solde restant (${remainingAmount.toLocaleString()} XOF)`);
        }
        // Calculate new total paid (after this payment)
        const newTotalPaid = currentTotalPaid + Number(montant);
        // Update payslip status
        let newStatus = 'EN_ATTENTE';
        if (newTotalPaid >= Number(payslip.net)) {
            newStatus = 'PAYE';
        }
        else if (newTotalPaid > 0) {
            newStatus = 'PARTIEL';
        }
        await this.prisma.payslip.update({
            where: { id: payslipId },
            data: { status: newStatus },
        });
        return payment;
    }
    async getPayments(user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.prisma.payment.findMany({
            where: {
                payslip: {
                    employee: { entrepriseId }
                }
            },
            include: {
                payslip: {
                    include: {
                        employee: true,
                        payRun: true,
                    },
                },
            },
        });
    }
    async generatePaymentReceiptPdf(paymentId, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        // Vérifier que le paiement appartient à l'entreprise de l'utilisateur
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                payslip: {
                    include: { employee: true }
                }
            }
        });
        if (!payment || payment.payslip.employee.entrepriseId !== entrepriseId) {
            throw new Error('Paiement non trouvé ou accès non autorisé');
        }
        return await pdfGenerator_1.PDFGenerator.generatePaymentReceiptPDF(paymentId, entrepriseId.toString());
    }
}
exports.PaymentsService = PaymentsService;
//# sourceMappingURL=PaymentsService.js.map