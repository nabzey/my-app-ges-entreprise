"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CongeRepository = void 0;
const client_1 = require("@prisma/client");
class CongeRepository {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(data) {
        return await this.prisma.congeRequest.create({
            data: {
                ...data,
                status: client_1.StatusConge.EN_ATTENTE,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        nom: true,
                        email: true,
                        poste: true,
                    }
                }
            }
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.employeeId)
            where.employeeId = filters.employeeId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.typeConge)
            where.typeConge = filters.typeConge;
        if (filters?.entrepriseId) {
            where.employee = {
                entrepriseId: filters.entrepriseId
            };
        }
        return await this.prisma.congeRequest.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
            include: {
                employee: {
                    select: {
                        id: true,
                        nom: true,
                        email: true,
                        poste: true,
                        entrepriseId: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return await this.prisma.congeRequest.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        id: true,
                        nom: true,
                        email: true,
                        poste: true,
                        entrepriseId: true,
                    }
                }
            }
        });
    }
    async update(id, data) {
        return await this.prisma.congeRequest.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        nom: true,
                        email: true,
                        poste: true,
                    }
                }
            }
        });
    }
    async getCongesByEmployee(employeeId, year) {
        const where = { employeeId };
        if (year) {
            where.dateDebut = {
                gte: new Date(`${year}-01-01`),
                lte: new Date(`${year}-12-31`)
            };
        }
        return await this.prisma.congeRequest.findMany({
            where,
            orderBy: { dateDebut: 'desc' }
        });
    }
    async countCongesByType(employeeId, typeConge, year) {
        const conges = await this.prisma.congeRequest.findMany({
            where: {
                employeeId,
                typeConge,
                status: client_1.StatusConge.APPROUVE,
                dateDebut: {
                    gte: new Date(`${year}-01-01`),
                    lte: new Date(`${year}-12-31`)
                }
            }
        });
        let totalDays = 0;
        for (const conge of conges) {
            const days = Math.ceil((conge.dateFin.getTime() - conge.dateDebut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            totalDays += days;
        }
        return totalDays;
    }
    async checkConflict(employeeId, dateDebut, dateFin, excludeId) {
        const where = {
            employeeId,
            status: {
                in: [client_1.StatusConge.EN_ATTENTE, client_1.StatusConge.APPROUVE]
            },
            OR: [
                {
                    dateDebut: { lte: dateFin },
                    dateFin: { gte: dateDebut }
                }
            ]
        };
        if (excludeId) {
            where.id = { not: excludeId };
        }
        const conflicts = await this.prisma.congeRequest.findMany({ where });
        return conflicts.length > 0;
    }
}
exports.CongeRepository = CongeRepository;
//# sourceMappingURL=CongeRepository.js.map