"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayslipsController = void 0;
const PayslipsService_1 = require("../services/PayslipsService");
const service = new PayslipsService_1.PayslipsService();
class PayslipsController {
    async getPayslips(req, res) {
        try {
            const user = req.user;
            // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
            if (user.role === 'SUPER_ADMIN') {
                return res.status(200).json({ message: 'Bulletins récupérés', data: [] });
            }
            const status = req.query.status;
            const payRunId = req.query.payRunId ? parseInt(req.query.payRunId, 10) : undefined;
            const payRunStatus = req.query.payRunStatus;
            const payslips = await service.getPayslips(user, status, payRunId, payRunStatus);
            res.status(200).json({ message: 'Bulletins récupérés', data: payslips });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getPayslipsByEmployee(req, res) {
        try {
            const user = req.user;
            // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
            if (user.role === 'SUPER_ADMIN') {
                return res.status(200).json({ message: 'Bulletins récupérés pour l\'employé', data: [] });
            }
            const employeeId = parseInt(req.params.employeeId || '', 10);
            if (isNaN(employeeId)) {
                return res.status(400).json({ message: 'ID d\'employé invalide' });
            }
            const payslips = await service.getPayslipsByEmployeeId(user, employeeId);
            res.status(200).json({ message: 'Bulletins récupérés pour l\'employé', data: payslips });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async downloadPayslipPdf(req, res) {
        try {
            const user = req.user;
            // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
            if (user.role === 'SUPER_ADMIN') {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            const payslipId = parseInt(req.params.id || '', 10);
            if (isNaN(payslipId)) {
                return res.status(400).json({ message: 'ID de bulletin invalide' });
            }
            const pdfBuffer = await service.generatePayslipPdf(payslipId, user);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=payslip_${payslipId}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async downloadMyPayslipPdf(req, res) {
        try {
            const user = req.user;
            // Vérifier que c'est un employé
            if (user.role !== 'EMPLOYEE') {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            const payslipId = parseInt(req.params.id || '', 10);
            if (isNaN(payslipId)) {
                return res.status(400).json({ message: 'ID de bulletin invalide' });
            }
            const entrepriseId = user.entrepriseId;
            if (!entrepriseId) {
                return res.status(400).json({ message: 'Entreprise non sélectionnée' });
            }
            // Vérifier que le bulletin appartient à l'employé
            const hasAccess = await service.checkPayslipOwnership(payslipId, user.employeeId, entrepriseId);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Accès non autorisé à ce bulletin' });
            }
            const pdfBuffer = await service.generatePayslipPdf(payslipId, user);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=payslip_${payslipId}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getPendingPayslipsCount(req, res) {
        try {
            const user = req.user;
            const count = await service.getPendingPayslipsCount(user);
            res.status(200).json({ message: 'Nombre de bulletins en attente récupéré', data: count });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.PayslipsController = PayslipsController;
//# sourceMappingURL=PayslipsController.js.map