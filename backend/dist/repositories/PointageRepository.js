"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointageRepository = void 0;
const client_1 = require("@prisma/client");
class PointageRepository {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(pointageData) {
        try {
            return await this.prisma.pointage.create({
                data: {
                    ...pointageData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            console.error('Erreur create Pointage:', error);
            throw new Error('Erreur lors de la création du pointage');
        }
    }
    async findAll(filters) {
        const where = {};
        if (filters?.employeeId)
            where.employeeId = filters.employeeId;
        if (filters?.entrepriseId)
            where.employee = { entrepriseId: filters.entrepriseId };
        if (filters?.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            where.heure = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }
        if (filters?.dateDebut && filters?.dateFin) {
            where.heure = {
                gte: filters.dateDebut,
                lte: filters.dateFin,
            };
        }
        if (filters?.type)
            where.type = filters.type;
        try {
            return await this.prisma.pointage.findMany({
                where: Object.keys(where).length > 0 ? where : undefined,
                include: { employee: true },
                orderBy: [
                    { employeeId: 'asc' },
                    { heure: 'asc' },
                ],
            });
        }
        catch (error) {
            console.error('Erreur findAll Pointages:', error);
            throw new Error('Erreur lors de la récupération des pointages');
        }
    }
    async getLastPointageTimeForEmployees(entrepriseId) {
        try {
            const result = await this.prisma.$queryRaw `
        SELECT employeeId, MAX(heure) as lastPointage
        FROM pointage
        INNER JOIN employee ON pointage.employeeId = employee.id
        WHERE employee.entrepriseId = ${entrepriseId}
        GROUP BY employeeId
      `;
            return result;
        }
        catch (error) {
            console.error('Erreur getLastPointageTimeForEmployees:', error);
            throw new Error('Erreur lors de la récupération des derniers pointages');
        }
    }
    async findById(id) {
        try {
            return await this.prisma.pointage.findUnique({
                where: { id },
                include: { employee: true },
            });
        }
        catch (error) {
            console.error('Erreur findById Pointage:', error);
            throw new Error('Erreur lors de la récupération du pointage par ID');
        }
    }
    async findByEmployeeAndDate(employeeId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        try {
            return await this.prisma.pointage.findMany({
                where: {
                    employeeId,
                    heure: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                orderBy: { heure: 'asc' },
            });
        }
        catch (error) {
            console.error('Erreur findByEmployeeAndDate Pointage:', error);
            throw new Error('Erreur lors de la récupération des pointages par employé et date');
        }
    }
    async update(id, data) {
        try {
            return await this.prisma.pointage.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            console.error('Erreur update Pointage:', error);
            throw new Error('Erreur lors de la mise à jour du pointage');
        }
    }
    async delete(id) {
        try {
            return await this.prisma.pointage.delete({
                where: { id },
            });
        }
        catch (error) {
            console.error('Erreur delete Pointage:', error);
            throw new Error('Erreur lors de la suppression du pointage');
        }
    }
    async calculateWorkedHours(employeeId, month, year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        try {
            const pointages = await this.prisma.pointage.findMany({
                where: {
                    employeeId,
                    heure: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
                orderBy: { heure: 'asc' },
            });
            let totalHours = 0;
            let arrivalTime = null;
            for (const pointage of pointages) {
                if (pointage.type === 'ARRIVEE') {
                    arrivalTime = pointage.heure;
                }
                else if (pointage.type === 'DEPART' && arrivalTime) {
                    const workedMs = pointage.heure.getTime() - arrivalTime.getTime();
                    totalHours += workedMs / (1000 * 60 * 60);
                    arrivalTime = null;
                }
            }
            return Math.round(totalHours * 100) / 100;
        }
        catch (error) {
            console.error('Erreur calculateWorkedHours Pointage:', error);
            throw new Error('Erreur lors du calcul des heures travaillées');
        }
    }
}
exports.PointageRepository = PointageRepository;
//# sourceMappingURL=PointageRepository.js.map