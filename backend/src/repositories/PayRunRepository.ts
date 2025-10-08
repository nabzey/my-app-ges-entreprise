import { PrismaClient, PayRun, StatusPayRun } from '@prisma/client';

export class PayRunRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: { periode: Date; type: string; status?: StatusPayRun; entrepriseId: number }) {
    return await this.prisma.payRun.create({ data });
  }

  async findAll(entrepriseId: number) {
    return await this.prisma.payRun.findMany({
      where: { entrepriseId },
      include: { payslips: { include: { employee: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number) {
    return await this.prisma.payRun.findUnique({
      where: { id },
      include: { payslips: { include: { employee: true, payments: true } } }
    });
  }

  async update(id: number, data: Partial<PayRun>) {
    return await this.prisma.payRun.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return await this.prisma.payRun.delete({ where: { id } });
  }

  async findByStatus(status: StatusPayRun, entrepriseId: number) {
    return await this.prisma.payRun.findMany({
      where: { status, entrepriseId },
      include: { payslips: { include: { employee: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByPeriod(startDate: Date, endDate: Date, entrepriseId: number) {
    return await this.prisma.payRun.findMany({
      where: {
        entrepriseId,
        periode: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { payslips: { include: { employee: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async generatePayslips(payRunId: number, entrepriseId: number) {
    // Get all active employees for this entreprise
    const employees = await this.prisma.employee.findMany({
      where: { actif: true, entrepriseId }
    });

    const payslips = [];
    for (const employee of employees) {
      let brut = employee.tauxSalaire;

      // For journalier, multiply by joursTravailles if set
      if (employee.typeContrat === 'JOURNALIER' && employee.joursTravailles) {
        brut = brut.mul(employee.joursTravailles);
      }

      // Simple calculation: net = brut - deductions (0 for now)
      const net = brut;

      const payslip = await this.prisma.payslip.create({
        data: {
          employeeId: employee.id,
          payRunId,
          brut,
          net,
          status: 'EN_ATTENTE'
        }
      });
      payslips.push(payslip);
    }

    return payslips;
  }
}
