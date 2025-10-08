"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const PaymentsService_1 = require("../services/PaymentsService");
const service = new PaymentsService_1.PaymentsService();
class PaymentsController {
    async recordPayment(req, res) {
        try {
            const user = req.user;
            // SUPER_ADMIN ne peut pas enregistrer de paiements tenant
            if (user.role === 'SUPER_ADMIN') {
                return res.status(403).json({ message: 'Action non autorisée pour ce type d\'utilisateur' });
            }
            const paymentData = req.body;
            const payment = await service.recordPayment(paymentData, user);
            res.status(201).json({ message: 'Paiement enregistré', data: payment });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getPayments(req, res) {
        try {
            const user = req.user;
            // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
            if (user.role === 'SUPER_ADMIN') {
                return res.status(200).json({ message: 'Paiements récupérés', data: [] });
            }
            const payments = await service.getPayments(user);
            res.status(200).json({ message: 'Paiements récupérés', data: payments });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async downloadPaymentReceipt(req, res) {
        try {
            const user = req.user;
            // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
            if (user.role === 'SUPER_ADMIN') {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            const paymentId = parseInt(req.params.id ?? '', 10);
            if (isNaN(paymentId)) {
                return res.status(400).json({ message: 'ID de paiement invalide' });
            }
            const pdfBuffer = await service.generatePaymentReceiptPdf(paymentId, user);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=payment_receipt_${paymentId}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.PaymentsController = PaymentsController;
//# sourceMappingURL=PaymentsController.js.map