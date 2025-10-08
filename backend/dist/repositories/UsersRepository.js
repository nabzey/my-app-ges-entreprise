"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const client_1 = require("@prisma/client");
class UsersRepository {
    static prismaInstance;
    prisma;
    constructor() {
        // Singleton PrismaClient pour éviter d'ouvrir plusieurs connexions
        if (!UsersRepository.prismaInstance) {
            UsersRepository.prismaInstance = new client_1.PrismaClient();
        }
        this.prisma = UsersRepository.prismaInstance;
    }
    async findById(id) {
        try {
            return await this.prisma.users.findUnique({
                where: { id },
                include: { entreprise: true }
            });
        }
        catch (error) {
            console.error("Error findById:", error);
            throw error;
        }
    }
    async create(data) {
        try {
            return await this.prisma.users.create({
                data,
                include: { entreprise: true }
            });
        }
        catch (error) {
            console.error("Error create user:", error);
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            return await this.prisma.users.findUnique({
                where: { email },
                include: { entreprise: true }
            });
        }
        catch (error) {
            console.error("Error findByEmail:", error);
            throw error;
        }
    }
    async findAllUsers() {
        try {
            return await this.prisma.users.findMany({
                include: { entreprise: true }
            });
        }
        catch (error) {
            console.error("Error findAllUsers:", error);
            throw error;
        }
    }
    async findUsersByEntrepriseId(entrepriseId) {
        try {
            return await this.prisma.users.findMany({
                where: { entrepriseId },
                include: { entreprise: true }
            });
        }
        catch (error) {
            console.error("Error findUsersByEntrepriseId:", error);
            throw error;
        }
    }
    async findUsersByRole(role) {
        try {
            return await this.prisma.users.findMany({
                where: { role: role },
                include: { entreprise: true }
            });
        }
        catch (error) {
            console.error("Error findUsersByRole:", error);
            throw error;
        }
    }
    async findUsersByEntrepriseIdAndRole(entrepriseId, role) {
        try {
            return await this.prisma.users.findMany({
                where: { entrepriseId, role }
            });
        }
        catch (error) {
            console.error("Error findUsersByEntrepriseIdAndRole:", error);
            throw error;
        }
    }
    async createEntreprise(data) {
        try {
            return await this.prisma.entreprises.create({
                data,
                include: { users: true }
            });
        }
        catch (error) {
            console.error("Error createEntreprise:", error);
            throw error;
        }
    }
    async findAllEntreprises() {
        try {
            return await this.prisma.entreprises.findMany({
                include: {
                    users: true,
                    _count: { select: { users: true } }
                }
            });
        }
        catch (error) {
            console.error("Error findAllEntreprises:", error);
            throw error;
        }
    }
    async findEntrepriseById(id) {
        try {
            return await this.prisma.entreprises.findUnique({
                where: { id },
                include: {
                    users: true,
                    _count: { select: { users: true } }
                }
            });
        }
        catch (error) {
            console.error("Error findEntrepriseById:", error);
            throw error;
        }
    }
    async updateEntreprise(id, data) {
        try {
            return await this.prisma.entreprises.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date()
                },
                include: { users: true }
            });
        }
        catch (error) {
            console.error("Error updateEntreprise:", error);
            throw error;
        }
    }
    async deleteEntreprise(id) {
        try {
            // Supprimer les utilisateurs liés d'abord
            await this.prisma.users.deleteMany({ where: { entrepriseId: id } });
            await this.prisma.entreprises.delete({ where: { id } });
        }
        catch (error) {
            console.error("Error deleteEntreprise:", error);
            throw error;
        }
    }
    async updateRole(id, role) {
        try {
            return await this.prisma.users.update({
                where: { id },
                data: { role: role },
                include: { entreprise: true }
            });
        }
        catch (error) {
            console.error("Error updateRole:", error);
            throw error;
        }
    }
}
exports.UsersRepository = UsersRepository;
//# sourceMappingURL=UsersRepository.js.map