"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayslipRepository = void 0;
const client_1 = require("@prisma/client");
class PayslipRepository {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(data) {
        return await this.prisma.payslip.create({ data });
    }
    async findAll(filters) {
        const where = {};
        if (filters.payRunId)
            where.payRunId = filters.payRunId;
        if (filters.employeeId)
            where.employeeId = filters.employeeId;
        if (filters.entrepriseId)
            where.employee = { entrepriseId: filters.entrepriseId };
        return await this.prisma.payslip.findMany({
            where,
            include: { employee: true, payRun: true, payments: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return await this.prisma.payslip.findUnique({
            where: { id },
            include: { employee: true, payRun: true, payments: true }
        });
    }
    async update(id, data) {
        return await this.prisma.payslip.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return await this.prisma.payslip.delete({ where: { id } });
    }
    async getByPayRun(payRunId) {
        return await this.prisma.payslip.findMany({
            where: { payRunId },
            include: { employee: true, payments: true }
        });
    }
}
exports.PayslipRepository = PayslipRepository;
//# sourceMappingURL=PayslipRepository.js.map