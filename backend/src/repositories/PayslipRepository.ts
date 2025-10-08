import { PrismaClient, Payslip, StatusPayslip } from '@prisma/client';

export class PayslipRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: {
    employeeId: number;
    payRunId: number;
    brut: number;
    deductions?: number;
    net: number;
    status?: StatusPayslip;
  }) {
    return await this.prisma.payslip.create({ data });
  }

  async findAll(filters: { payRunId?: number; employeeId?: number; entrepriseId?: number }) {
    const where: any = {};
    if (filters.payRunId) where.payRunId = filters.payRunId;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.entrepriseId) where.employee = { entrepriseId: filters.entrepriseId };

    return await this.prisma.payslip.findMany({
      where,
      include: { employee: true, payRun: true, payments: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number) {
    return await this.prisma.payslip.findUnique({
      where: { id },
      include: { employee: true, payRun: true, payments: true }
    });
  }

  async update(id: number, data: Partial<Payslip>) {
    return await this.prisma.payslip.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return await this.prisma.payslip.delete({ where: { id } });
  }

  async getByPayRun(payRunId: number) {
    return await this.prisma.payslip.findMany({
      where: { payRunId },
      include: { employee: true, payments: true }
    });
  }
}
