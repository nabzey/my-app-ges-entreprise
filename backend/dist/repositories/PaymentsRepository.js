"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsRepository = void 0;
const client_1 = require("@prisma/client");
class PaymentsRepository {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(data) {
        return await this.prisma.payment.create({ data });
    }
    async findAll(entrepriseId) {
        const where = {};
        if (entrepriseId) {
            where.payslip = {
                employee: { entrepriseId }
            };
        }
        return await this.prisma.payment.findMany({
            where,
            include: {
                payslip: {
                    include: {
                        employee: true,
                        payRun: true
                    }
                }
            }
        });
    }
    async findById(id) {
        return await this.prisma.payment.findUnique({
            where: { id },
            include: { payslip: { include: { employee: true } } }
        });
    }
    async update(id, data) {
        return await this.prisma.payment.update({
            where: { id },
            data,
            include: { payslip: { include: { employee: true } } }
        });
    }
    async delete(id) {
        return await this.prisma.payment.delete({ where: { id } });
    }
    async findByPayslipId(payslipId) {
        return await this.prisma.payment.findMany({
            where: { payslipId },
            orderBy: { date: 'desc' }
        });
    }
    async findByEmployeeId(employeeId) {
        return await this.prisma.payment.findMany({
            where: {
                payslip: {
                    employeeId
                }
            },
            include: {
                payslip: {
                    include: { employee: true }
                }
            },
            orderBy: { date: 'desc' }
        });
    }
}
exports.PaymentsRepository = PaymentsRepository;
//# sourceMappingURL=PaymentsRepository.js.map