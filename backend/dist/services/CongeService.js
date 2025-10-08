"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CongeService = void 0;
const CongeRepository_1 = require("../repositories/CongeRepository");
const client_1 = require("@prisma/client");
const emailService_1 = require("../utils/emailService");
class CongeService {
    repo = new CongeRepository_1.CongeRepository();
    emailService = new emailService_1.EmailService();
    CONGE_ANNUEL_LIMIT = 30;
    CONGE_MALADIE_LIMIT = 15;
    async createCongeRequest(data) {
        const debut = new Date(data.dateDebut);
        const fin = new Date(data.dateFin);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (debut < today) {
            throw new Error('La date de début ne peut pas être dans le passé');
        }
        if (fin < debut) {
            throw new Error('La date de fin doit être après la date de début');
        }
        const hasConflict = await this.repo.checkConflict(data.employeeId, debut, fin);
        if (hasConflict) {
            throw new Error('Vous avez déjà une demande de congé sur cette période');
        }
        const nombreJours = this.calculateWorkDays(debut, fin);
        if (nombreJours < 1) {
            throw new Error('La durée du congé doit être d\'au moins 1 jour');
        }
        const currentYear = debut.getFullYear();
        if (data.typeConge === client_1.TypeConge.ANNUEL) {
            const congesUtilises = await this.repo.countCongesByType(data.employeeId, client_1.TypeConge.ANNUEL, currentYear);
            if (congesUtilises + nombreJours > this.CONGE_ANNUEL_LIMIT) {
                throw new Error(`Vous ne pouvez pas prendre plus de ${this.CONGE_ANNUEL_LIMIT} jours de congés annuels. Vous avez déjà utilisé ${congesUtilises} jours.`);
            }
        }
        const congeRequest = await this.repo.create(data);
        return congeRequest;
    }
    async getAllCongeRequests(filters) {
        return await this.repo.findAll(filters);
    }
    async getCongeRequestById(id) {
        return await this.repo.findById(id);
    }
    async approveCongeRequest(id, commentaireRH) {
        const congeRequest = await this.repo.findById(id);
        if (!congeRequest) {
            throw new Error('Demande de congé non trouvée');
        }
        if (congeRequest.status !== client_1.StatusConge.EN_ATTENTE) {
            throw new Error('Cette demande a déjà été traitée');
        }
        const updated = await this.repo.update(id, {
            status: client_1.StatusConge.APPROUVE,
            ...(commentaireRH !== undefined && { commentaireRH })
        });
        // Envoyer un email de confirmation à l'employé
        // await this.emailService.sendCongeApprovalEmail(updated);
        return updated;
    }
    async rejectCongeRequest(id, commentaireRH) {
        const congeRequest = await this.repo.findById(id);
        if (!congeRequest) {
            throw new Error('Demande de congé non trouvée');
        }
        if (congeRequest.status !== client_1.StatusConge.EN_ATTENTE) {
            throw new Error('Cette demande a déjà été traitée');
        }
        if (!commentaireRH) {
            throw new Error('Un commentaire est requis pour rejeter une demande');
        }
        const updated = await this.repo.update(id, {
            status: client_1.StatusConge.REJETE,
            commentaireRH
        });
        // Envoyer un email de rejet à l'employé
        // await this.emailService.sendCongeRejectionEmail(updated);
        return updated;
    }
    async cancelCongeRequest(id, employeeId) {
        const congeRequest = await this.repo.findById(id);
        if (!congeRequest) {
            throw new Error('Demande de congé non trouvée');
        }
        if (congeRequest.employeeId !== employeeId) {
            throw new Error('Vous ne pouvez pas annuler cette demande');
        }
        if (congeRequest.status === client_1.StatusConge.APPROUVE) {
            // Vérifier si le congé n'a pas déjà commencé
            const today = new Date();
            if (congeRequest.dateDebut <= today) {
                throw new Error('Impossible d\'annuler un congé déjà commencé');
            }
        }
        if (congeRequest.status === client_1.StatusConge.ANNULE || congeRequest.status === client_1.StatusConge.REJETE) {
            throw new Error('Cette demande a déjà été annulée ou rejetée');
        }
        return await this.repo.update(id, {
            status: client_1.StatusConge.ANNULE
        });
    }
    async getCongeBalance(employeeId) {
        const currentYear = new Date().getFullYear();
        const congesAnnuelsUtilises = await this.repo.countCongesByType(employeeId, client_1.TypeConge.ANNUEL, currentYear);
        const congesMaladieUtilises = await this.repo.countCongesByType(employeeId, client_1.TypeConge.MALADIE, currentYear);
        const congesEnAttente = await this.repo.findAll({
            employeeId,
            status: client_1.StatusConge.EN_ATTENTE
        });
        return {
            congesAnnuels: {
                utilises: congesAnnuelsUtilises,
                restants: this.CONGE_ANNUEL_LIMIT - congesAnnuelsUtilises,
                total: this.CONGE_ANNUEL_LIMIT
            },
            congesMaladie: {
                utilises: congesMaladieUtilises,
                restants: this.CONGE_MALADIE_LIMIT - congesMaladieUtilises,
                total: this.CONGE_MALADIE_LIMIT
            },
            congesEnAttente: congesEnAttente.length
        };
    }
    calculateWorkDays(startDate, endDate) {
        let count = 0;
        const current = new Date(startDate);
        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            // Exclure samedi (6) et dimanche (0)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    }
}
exports.CongeService = CongeService;
//# sourceMappingURL=CongeService.js.map