import { PrismaClient, Payment } from '@prisma/client';

export class PaymentsRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) {
    return await this.prisma.payment.create({ data });
  }

  async findAll(entrepriseId?: number) {
    const where: any = {};
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

  async findById(id: number) {
    return await this.prisma.payment.findUnique({
      where: { id },
      include: { payslip: { include: { employee: true } } }
    });
  }

  async update(id: number, data: Partial<Payment>) {
    return await this.prisma.payment.update({
      where: { id },
      data,
      include: { payslip: { include: { employee: true } } }
    });
  }

  async delete(id: number) {
    return await this.prisma.payment.delete({ where: { id } });
  }

  async findByPayslipId(payslipId: number) {
    return await this.prisma.payment.findMany({
      where: { payslipId },
      orderBy: { date: 'desc' }
    });
  }

  async findByEmployeeId(employeeId: number) {
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
