"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CongeController = void 0;
const CongeService_1 = require("../services/CongeService");
const validate_1 = require("../validators/validate");
class CongeController {
    service = new CongeService_1.CongeService();
    // Créer une demande de congé (Employé)
    async createCongeRequest(req, res) {
        try {
            const employeeId = req.user?.id;
            if (!employeeId) {
                return res.status(401).json({ message: 'Utilisateur non authentifié' });
            }
            const validatedData = validate_1.congeRequestCreateSchema.parse(req.body);
            const { motif, ...otherData } = validatedData;
            const congeRequest = await this.service.createCongeRequest({
                employeeId,
                ...otherData,
                ...(motif !== undefined && { motif })
            });
            res.status(201).json({
                message: 'Demande de congé créée avec succès',
                data: congeRequest
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // Récupérer ses propres demandes de congé (Employé)
    async getMyCongeRequests(req, res) {
        try {
            const employeeId = req.user?.id;
            if (!employeeId) {
                return res.status(401).json({ message: 'Utilisateur non authentifié' });
            }
            const filters = { employeeId };
            if (req.query.status) {
                filters.status = req.query.status;
            }
            if (req.query.typeConge) {
                filters.typeConge = req.query.typeConge;
            }
            const congeRequests = await this.service.getAllCongeRequests(filters);
            res.status(200).json({
                message: 'Demandes de congé récupérées',
                data: congeRequests
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Récupérer une demande spécifique (Employé)
    async getMyCongeRequestById(req, res) {
        try {
            const employeeId = req.user?.id;
            if (!req.params.id) {
                return res.status(400).json({ message: 'ID manquant' });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ message: 'ID invalide' });
            }
            const congeRequest = await this.service.getCongeRequestById(id);
            if (!congeRequest) {
                return res.status(404).json({ message: 'Demande de congé non trouvée' });
            }
            // Vérifier que la demande appartient à l'employé
            if (congeRequest.employeeId !== employeeId) {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            res.status(200).json({
                message: 'Demande de congé récupérée',
                data: congeRequest
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Annuler sa demande de congé (Employé)
    async cancelCongeRequest(req, res) {
        try {
            const employeeId = req.user?.id;
            if (!req.params.id) {
                return res.status(400).json({ message: 'ID manquant' });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ message: 'ID invalide' });
            }
            const congeRequest = await this.service.cancelCongeRequest(id, employeeId);
            res.status(200).json({
                message: 'Demande de congé annulée',
                data: congeRequest
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // Consulter son solde de congés (Employé)
    async getCongeBalance(req, res) {
        try {
            const employeeId = req.user?.id;
            if (!employeeId) {
                return res.status(401).json({ message: 'Utilisateur non authentifié' });
            }
            const balance = await this.service.getCongeBalance(employeeId);
            res.status(200).json({
                message: 'Solde de congés récupéré',
                data: balance
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Récupérer toutes les demandes (Admin)
    async getAllCongeRequests(req, res) {
        try {
            const filters = {};
            if (req.query.status) {
                filters.status = req.query.status;
            }
            if (req.query.typeConge) {
                filters.typeConge = req.query.typeConge;
            }
            if (req.query.employeeId) {
                filters.employeeId = parseInt(req.query.employeeId);
            }
            // Pour SUPER_ADMIN, permettre de filtrer par entreprise
            let entrepriseId = req.user?.entrepriseId;
            if (req.user?.role === 'SUPER_ADMIN' && req.query.entrepriseId) {
                entrepriseId = parseInt(req.query.entrepriseId);
            }
            if (entrepriseId) {
                filters.entrepriseId = entrepriseId;
            }
            const congeRequests = await this.service.getAllCongeRequests(filters);
            res.status(200).json({
                message: 'Demandes de congé récupérées',
                data: congeRequests
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Récupérer une demande spécifique (Admin)
    async getCongeRequestById(req, res) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ message: 'ID manquant' });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ message: 'ID invalide' });
            }
            const congeRequest = await this.service.getCongeRequestById(id);
            if (!congeRequest) {
                return res.status(404).json({ message: 'Demande de congé non trouvée' });
            }
            res.status(200).json({
                message: 'Demande de congé récupérée',
                data: congeRequest
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Approuver une demande (Admin)
    async approveCongeRequest(req, res) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ message: 'ID manquant' });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ message: 'ID invalide' });
            }
            const validatedData = validate_1.congeApproveSchema.parse(req.body);
            const congeRequest = await this.service.approveCongeRequest(id, validatedData.commentaireRH);
            res.status(200).json({
                message: 'Demande de congé approuvée',
                data: congeRequest
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // Rejeter une demande (Admin)
    async rejectCongeRequest(req, res) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ message: 'ID manquant' });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ message: 'ID invalide' });
            }
            const validatedData = validate_1.congeRejectSchema.parse(req.body);
            const congeRequest = await this.service.rejectCongeRequest(id, validatedData.commentaireRH);
            res.status(200).json({
                message: 'Demande de congé rejetée',
                data: congeRequest
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // Récupérer les demandes d'un employé spécifique (Admin)
    async getCongeRequestsByEmployee(req, res) {
        try {
            if (!req.params.employeeId) {
                return res.status(400).json({ message: 'ID employé manquant' });
            }
            const employeeId = parseInt(req.params.employeeId);
            if (isNaN(employeeId) || employeeId <= 0) {
                return res.status(400).json({ message: 'ID employé invalide' });
            }
            const congeRequests = await this.service.getAllCongeRequests({ employeeId });
            res.status(200).json({
                message: 'Demandes de congé de l\'employé récupérées',
                data: congeRequests
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.CongeController = CongeController;
//# sourceMappingURL=CongeController.js.map