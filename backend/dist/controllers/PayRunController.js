"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayRunController = void 0;
const PayRunService_1 = require("../services/PayRunService");
class PayRunController {
    service = new PayRunService_1.PayRunService();
    async getAll(req, res) {
        try {
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.json([]);
            const dbName = req.user.dbName;
            const payRuns = await this.service.findAll(dbName);
            res.json(payRuns);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.status(404).json({ message: 'PayRun non trouvé' });
            const dbName = req.user.dbName;
            const payRun = await this.service.findById(id, dbName);
            if (!payRun)
                return res.status(404).json({ message: 'PayRun non trouvé' });
            res.json(payRun);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async approvePayRun(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.status(400).json({ message: 'Action non autorisée' });
            const dbName = req.user.dbName;
            const payRun = await this.service.approvePayRun(id, dbName);
            res.json({ message: 'PayRun approuvé', payRun });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async closePayRun(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.status(400).json({ message: 'Action non autorisée' });
            const dbName = req.user.dbName;
            const payRun = await this.service.closePayRun(id, dbName);
            res.json({ message: 'PayRun clôturé', payRun });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async getByStatus(req, res) {
        try {
            const status = req.params.status;
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.json([]);
            const dbName = req.user.dbName;
            const payRuns = await this.service.getPayRunsByStatus(status, dbName);
            res.json(payRuns);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getByPeriod(req, res) {
        try {
            const year = parseInt(req.params.year);
            const month = parseInt(req.params.month);
            if (!req.user)
                return res.status(400).json({ message: 'Utilisateur non authentifié' });
            if (!req.user.dbName)
                return res.json([]);
            const dbName = req.user.dbName;
            const payRuns = await this.service.getPayRunsByPeriod(year, month, dbName);
            res.json(payRuns);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.PayRunController = PayRunController;
//# sourceMappingURL=PayRunController.js.map