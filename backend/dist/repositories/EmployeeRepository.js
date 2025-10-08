"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeRepository = void 0;
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
class EmployeeRepository {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(employeeData) {
        // Stocker l'email en minuscule pour uniformité
        const emailLower = employeeData.email.toLowerCase();
        return await this.prisma.employee.create({
            data: {
                ...employeeData,
                email: emailLower,
                tauxSalaire: new client_2.Prisma.Decimal(employeeData.tauxSalaire),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.poste)
            where.poste = { contains: filters.poste, mode: 'insensitive' }; // OK ici
        if (filters?.typeContrat)
            where.typeContrat = filters.typeContrat;
        if (filters?.actif !== undefined)
            where.actif = filters.actif;
        if (filters?.entrepriseId)
            where.entrepriseId = filters.entrepriseId;
        return await this.prisma.employee.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
        });
    }
    async findById(id) {
        return await this.prisma.employee.findUnique({
            where: { id },
        });
    }
    async update(id, data) {
        // Si email dans data, forcer en minuscule aussi
        if (data.email) {
            data.email = data.email.toLowerCase();
        }
        return await this.prisma.employee.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }
    async delete(id) {
        return await this.prisma.employee.delete({
            where: { id },
        });
    }
    // Recherche insensible à la casse, sans 'mode' qui pose problème
    async findByEmail(email) {
        const emailLower = email.toLowerCase();
        // Recherche stricte par égalité, en forçant la casse minuscule côté base
        return await this.prisma.employee.findUnique({
            where: { email: emailLower },
            include: {
                entreprise: true,
            },
        });
    }
}
exports.EmployeeRepository = EmployeeRepository;
//# sourceMappingURL=EmployeeRepository.js.map