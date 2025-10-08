"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointageController = void 0;
const PointageService_1 = require("../services/PointageService");
const service = new PointageService_1.PointageService();
class PointageController {
    async create(req, res) {
        try {
            const user = req.user;
            const { employeeId, type, heure } = req.body;
            if (!employeeId || !type) {
                return res.status(400).json({ message: 'employeeId et type sont requis' });
            }
            // Validate type
            const validTypes = ['ARRIVEE', 'DEPART', 'PAUSE_DEBUT', 'PAUSE_FIN'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ message: 'Type de pointage invalide' });
            }
            const pointage = await service.create({
                employeeId: parseInt(employeeId),
                type: type,
                heure: heure ? new Date(heure) : new Date()
            }, user);
            res.status(201).json({ message: 'Pointage créé', data: pointage });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getById(req, res) {
        try {
            const user = req.user;
            const id = parseInt(req.params.id || '');
            if (isNaN(id)) {
                return res.status(400).json({ message: 'ID invalide' });
            }
            const pointage = await service.findById(id, user);
            if (!pointage) {
                return res.status(404).json({ message: 'Pointage non trouvé' });
            }
            res.status(200).json({ message: 'Pointage récupéré', data: pointage });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const user = req.user;
            const { employeeId, date, dateDebut, dateFin, type } = req.query;
            const filters = {};
            if (employeeId)
                filters.employeeId = parseInt(employeeId);
            if (date)
                filters.date = new Date(date);
            if (dateDebut)
                filters.dateDebut = new Date(dateDebut);
            if (dateFin)
                filters.dateFin = new Date(dateFin);
            if (type)
                filters.type = type;
            const pointages = await service.findAll(filters, user);
            res.status(200).json({ message: 'Pointages récupérés', data: pointages });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getByEmployeeAndDate(req, res) {
        try {
            const user = req.user;
            const employeeId = parseInt(req.params.employeeId || '');
            const date = new Date(req.params.date || '');
            if (isNaN(employeeId)) {
                return res.status(400).json({ message: 'ID d\'employé invalide' });
            }
            const pointages = await service.findByEmployeeAndDate(employeeId, date, user);
            res.status(200).json({ message: 'Pointages récupérés', data: pointages });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getWorkedHours(req, res) {
        try {
            const user = req.user;
            const employeeId = parseInt(req.params.employeeId || '');
            const month = parseInt(req.params.month || '');
            const year = parseInt(req.params.year || '');
            if (isNaN(employeeId) || isNaN(month) || isNaN(year)) {
                return res.status(400).json({ message: 'Paramètres invalides' });
            }
            const hours = await service.calculateWorkedHours(employeeId, month, year, user);
            res.status(200).json({ message: 'Heures travaillées calculées', data: { hours } });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getAttendanceSummary(req, res) {
        try {
            const user = req.user;
            const employeeId = parseInt(req.params.employeeId || '');
            const month = parseInt(req.params.month || '');
            const year = parseInt(req.params.year || '');
            if (isNaN(employeeId) || isNaN(month) || isNaN(year)) {
                return res.status(400).json({ message: 'Paramètres invalides' });
            }
            const summary = await service.getEmployeeAttendanceSummary(employeeId, month, year, user);
            res.status(200).json({ message: 'Résumé de présence récupéré', data: summary });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async update(req, res) {
        try {
            const user = req.user;
            const id = parseInt(req.params.id || '');
            const { type, heure } = req.body;
            if (isNaN(id)) {
                return res.status(400).json({ message: 'ID invalide' });
            }
            const updateData = {};
            if (type) {
                const validTypes = ['ARRIVEE', 'DEPART', 'PAUSE_DEBUT', 'PAUSE_FIN'];
                if (!validTypes.includes(type)) {
                    return res.status(400).json({ message: 'Type de pointage invalide' });
                }
                updateData.type = type;
            }
            if (heure)
                updateData.heure = new Date(heure);
            const pointage = await service.update(id, updateData, user);
            res.status(200).json({ message: 'Pointage mis à jour', data: pointage });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async delete(req, res) {
        try {
            const user = req.user;
            const id = parseInt(req.params.id || '');
            if (isNaN(id)) {
                return res.status(400).json({ message: 'ID invalide' });
            }
            await service.delete(id, user);
            res.status(200).json({ message: 'Pointage supprimé' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async createEmployeePointage(req, res) {
        try {
            const { employeeId, type } = req.body;
            if (!employeeId || !type) {
                return res.status(400).json({ message: 'employeeId et type requis' });
            }
            // Trouver l'employé via son ID dans la base de données unique
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            const employee = await prisma.employee.findFirst({
                where: { id: parseInt(employeeId), actif: true },
                include: { entreprise: true }
            });
            if (!employee) {
                return res.status(404).json({ message: 'Employé non trouvé ou inactif' });
            }
            // Valider le type de pointage
            const validTypes = ['ARRIVEE', 'DEPART', 'PAUSE_DEBUT', 'PAUSE_FIN'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ message: 'Type de pointage invalide' });
            }
            // Créer un faux utilisateur pour le service (puisque c'est public)
            const fakeUser = { entrepriseId: employee.entrepriseId };
            const pointage = await service.create({
                employeeId: employee.id,
                type: type,
                heure: new Date()
            }, fakeUser);
            res.status(201).json({
                message: 'Pointage enregistré',
                data: {
                    employee: employee.nom,
                    type: type,
                    heure: pointage.heure
                }
            });
        }
        catch (error) {
            console.error('Erreur pointage employé:', error);
            res.status(500).json({ message: error.message });
        }
    }
    async getLastPointageTimeForEmployees(req, res) {
        try {
            const user = req.user;
            const lastPointages = await service.getLastPointageTimeForEmployees(user);
            res.status(200).json({ message: 'Derniers pointages récupérés', data: lastPointages });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getAttendance(req, res) {
        try {
            const user = req.user;
            const entrepriseId = user.entrepriseId;
            if (!entrepriseId) {
                return res.status(400).json({ message: 'Entreprise non trouvée' });
            }
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            const { employeeId, date, dateDebut, dateFin } = req.query;
            const where = { employee: { entrepriseId } };
            if (employeeId)
                where.employeeId = parseInt(employeeId);
            if (date)
                where.date = new Date(date);
            if (dateDebut || dateFin) {
                where.date = {};
                if (dateDebut)
                    where.date.gte = new Date(dateDebut);
                if (dateFin)
                    where.date.lte = new Date(dateFin);
            }
            const attendance = await prisma.attendance.findMany({
                where,
                include: { employee: true },
                orderBy: { date: 'desc' }
            });
            res.status(200).json({ message: 'Présences récupérées', data: attendance });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async markAbsences(req, res) {
        try {
            const user = req.user;
            const { date } = req.body;
            if (!date) {
                return res.status(400).json({ message: 'Date requise' });
            }
            await service.markAbsencesForDate(new Date(date), user);
            res.status(200).json({ message: 'Absences marquées pour la date donnée' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.PointageController = PointageController;
//# sourceMappingURL=PointageController.js.map