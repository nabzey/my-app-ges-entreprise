"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const EmployeeRepository_1 = require("../repositories/EmployeeRepository");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const qrCodeGenerator_1 = require("../utils/qrCodeGenerator");
const emailService_1 = require("../utils/emailService");
const bcrypt_1 = __importDefault(require("bcrypt"));
class EmployeeService {
    repo = new EmployeeRepository_1.EmployeeRepository();
    emailService = new emailService_1.EmailService();
    async create(employeeData, entrepriseId) {
        // Validation métier
        if (employeeData.tauxSalaire <= 0) {
            throw new Error('Le taux salaire doit être positif');
        }
        if (employeeData.typeContrat === client_1.TypeContrat.JOURNALIER && (!employeeData.joursTravailles || employeeData.joursTravailles <= 0)) {
            throw new Error('Le nombre de jours travaillés est requis pour les contrats journaliers');
        }
        // Vérifier si l'email existe déjà
        const existingEmployee = await this.repo.findByEmail(employeeData.email);
        if (existingEmployee) {
            throw new Error('Un employé avec cet email existe déjà');
        }
        // Générer un mot de passe si non fourni
        const generatedPassword = employeeData.password || Math.random().toString(36).substring(2, 10);
        // Hasher le mot de passe
        const hashedPassword = await bcrypt_1.default.hash(generatedPassword, 10);
        // Générer le QR code immédiatement
        const qrCode = qrCodeGenerator_1.QRCodeGenerator.generateQRCodeText(0, employeeData.nom); // ID sera mis à jour après création
        const data = {
            nom: employeeData.nom,
            email: employeeData.email,
            password: hashedPassword,
            poste: employeeData.poste,
            typeContrat: employeeData.typeContrat,
            tauxSalaire: employeeData.tauxSalaire,
            coordonneesBancaires: employeeData.coordonneesBancaires || null,
            actif: employeeData.actif ?? true,
            joursTravailles: employeeData.joursTravailles || null,
            qrCode,
            confirmationCode: null, // Plus de confirmation nécessaire
            entrepriseId
        };
        const employee = await this.repo.create(data);
        // Mettre à jour le QR code avec l'ID réel
        const updatedQrCode = qrCodeGenerator_1.QRCodeGenerator.generateQRCodeText(employee.id, employeeData.nom);
        await this.repo.update(employee.id, { qrCode: updatedQrCode });
        // Envoyer l'email avec le QR code et les identifiants
        await this.emailService.sendWelcomeEmail(employeeData.email, generatedPassword, updatedQrCode, employeeData.nom);
        return { ...employee, qrCode: updatedQrCode };
    }
    async findAll(filters, entrepriseId) {
        return await this.repo.findAll({ ...filters, entrepriseId });
    }
    async findById(id) {
        return await this.repo.findById(id);
    }
    async update(id, data) {
        // Validation métier
        if (data.tauxSalaire !== undefined && data.tauxSalaire <= 0) {
            throw new Error('Le taux salaire doit être positif');
        }
        // Vérifier l'employé existant pour valider les changements
        const existingEmployee = await this.repo.findById(id);
        if (!existingEmployee) {
            throw new Error('Employé non trouvé');
        }
        // Validation pour les contrats journaliers
        const finalTypeContrat = data.typeContrat || existingEmployee.typeContrat;
        const finalJoursTravailles = data.joursTravailles !== undefined ? data.joursTravailles : existingEmployee.joursTravailles;
        if (finalTypeContrat === client_1.TypeContrat.JOURNALIER && (!finalJoursTravailles || finalJoursTravailles <= 0)) {
            throw new Error('Le nombre de jours travaillés est requis pour les contrats journaliers');
        }
        const updateData = { ...data };
        if (data.tauxSalaire !== undefined) {
            updateData.tauxSalaire = new client_2.Prisma.Decimal(data.tauxSalaire);
        }
        return await this.repo.update(id, updateData);
    }
    async delete(id) {
        return await this.repo.delete(id);
    }
    async toggleActif(id) {
        const employee = await this.repo.findById(id);
        if (!employee) {
            throw new Error('Employé non trouvé');
        }
        return await this.repo.update(id, { actif: !employee.actif });
    }
    async confirmCode(employeeId, code) {
        // Since QR code is sent directly on creation, this method is kept for compatibility
        // but QR code is already generated and sent
        const employee = await this.repo.findById(employeeId);
        if (!employee) {
            throw new Error('Employé non trouvé');
        }
        return employee;
    }
    async login(email, password) {
        const employee = await this.repo.findByEmail(email);
        if (!employee) {
            throw new Error("Employé non trouvé");
        }
        if (!employee.password) {
            throw new Error("Mot de passe non défini");
        }
        const isPassValid = await bcrypt_1.default.compare(password, employee.password);
        if (!isPassValid) {
            throw new Error("Mot de passe incorrect");
        }
        if (!employee.actif) {
            throw new Error("Compte désactivé");
        }
        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({
            id: employee.id,
            email: employee.email,
            role: 'EMPLOYEE',
            entrepriseId: employee.entrepriseId,
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const userPayload = {
            id: employee.id,
            email: employee.email,
            nom: employee.nom,
            poste: employee.poste,
            role: 'EMPLOYEE',
            qrCode: employee.qrCode,
            entreprise: {
                id: employee.entreprise.id,
                nom: employee.entreprise.nom,
                adresse: employee.entreprise.adresse,
            }
        };
        return { user: userPayload, token };
    }
    async getDashboard(employeeId) {
        const employee = await this.repo.findById(employeeId);
        if (!employee) {
            throw new Error('Employé non trouvé');
        }
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        // Calculate worked hours for current month
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const pointages = await prisma.pointage.findMany({
            where: {
                employeeId,
                date: {
                    gte: new Date(currentYear, currentMonth - 1, 1),
                    lt: new Date(currentYear, currentMonth, 1)
                }
            }
        });
        let workedHours = 0;
        pointages.forEach((pointage) => {
            if (pointage.type === 'DEPART' && pointage.heure) {
                // Simple calculation: assume 8 hours per day if departure exists
                workedHours += 8;
            }
        });
        // Get absences (marked as ABSENT in attendance)
        const absences = await prisma.attendance.findMany({
            where: {
                employeeId,
                status: 'ABSENT',
                date: {
                    gte: new Date(currentYear, currentMonth - 1, 1),
                    lt: new Date(currentYear, currentMonth, 1)
                }
            }
        });
        // Simple schedule (placeholder)
        const schedule = {
            monday: { start: '08:00', end: '17:00' },
            tuesday: { start: '08:00', end: '17:00' },
            wednesday: { start: '08:00', end: '17:00' },
            thursday: { start: '08:00', end: '17:00' },
            friday: { start: '08:00', end: '17:00' },
            saturday: null,
            sunday: null
        };
        return {
            workedHours,
            absences,
            schedule,
            currentMonth,
            currentYear
        };
    }
}
exports.EmployeeService = EmployeeService;
//# sourceMappingURL=EmployeeService.js.map