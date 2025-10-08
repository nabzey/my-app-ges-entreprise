"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayslipController = void 0;
const PayslipService_1 = require("../services/PayslipService");
const validate_1 = require("../validators/validate");
const pdfGenerator_1 = require("../utils/pdfGenerator");
class PayslipController {
    service = new PayslipService_1.PayslipService();
    async getAll(req, res) {
        try {
            const filters = {};
            if (req.query.payRunId)
                filters.payRunId = parseInt(req.query.payRunId);
            if (req.query.employeeId)
                filters.employeeId = parseInt(req.query.employeeId);
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.json([]);
            const dbName = req.user.dbName;
            const payslips = await this.service.findAll(filters, dbName);
            res.json(payslips);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            console.log(id);
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.status(404).json({ message: 'Payslip non trouvé' });
            const dbName = req.user.dbName;
            const payslip = await this.service.findById(id, dbName);
            if (!payslip)
                return res.status(404).json({ message: 'Payslip non trouvé' });
            res.json(payslip);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const validatedData = validate_1.payslipUpdateSchema.parse(req.body);
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.status(400).json({ message: 'Action non autorisée' });
            const dbName = req.user.dbName;
            const payslip = await this.service.update(id, validatedData, dbName);
            res.json(payslip);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            if (!status)
                return res.status(400).json({ message: 'Status requis' });
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.status(400).json({ message: 'Action non autorisée' });
            const dbName = req.user.dbName;
            const payslip = await this.service.updateStatus(id, status, dbName);
            res.json(payslip);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async generateMonthlyPayslips(req, res) {
        try {
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.status(400).json({ message: 'Veuillez sélectionner une entreprise pour générer les bulletins' });
            const dbName = req.user.dbName;
            const { period } = req.body;
            const result = await this.service.generateMonthlyPayslips(dbName, period);
            res.json({
                message: 'Bulletins générés avec succès',
                data: result
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async generatePDF(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.status(404).json({ message: 'Bulletin non trouvé' });
            const dbName = req.user.dbName;
            // Vérifier que le cycle de paie n'est pas en brouillon
            const payslip = await this.service.findById(id, dbName);
            if (!payslip)
                return res.status(404).json({ message: 'Bulletin non trouvé' });
            if (payslip.payRun.status === 'BROUILLON') {
                return res.status(400).json({ message: 'Le cycle de paie est en brouillon. Approuvez-le d\'abord pour télécharger les bulletins.' });
            }
            const buffer = await pdfGenerator_1.PDFGenerator.generatePayslipPDF(id, dbName);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=bulletin_${id}.pdf`);
            res.send(buffer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.PayslipController = PayslipController;
//# sourceMappingURL=PayslipController.js.map