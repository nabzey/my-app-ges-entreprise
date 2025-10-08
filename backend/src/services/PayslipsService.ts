import { PrismaClient } from '@prisma/client';
import { Users } from '@prisma/client';
import { PDFGenerator } from '../utils/pdfGenerator';

export class PayslipsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async generatePayslipPdf(payslipId: number, user: Users) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    // Vérifier que le payslip appartient à l'entreprise de l'utilisateur
    const payslip = await this.prisma.payslip.findUnique({
      where: { id: payslipId },
      include: { employee: true }
    });

    if (!payslip || payslip.employee.entrepriseId !== entrepriseId) {
      throw new Error('Bulletin de paie non trouvé ou accès non autorisé');
    }

    return await PDFGenerator.generatePayslipPDF(payslipId, entrepriseId.toString());
  }

  async getPayslips(user: Users, status?: string, payRunId?: number, payRunStatus?: string) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    // Fetch payslips for the user's entreprise
    const where: any = {
      employee: { entrepriseId }
    };
    if (status) {
      where.status = status;
    }
    if (payRunId) {
      where.payRunId = payRunId;
    }
    if (payRunStatus) {
      where.payRun = { status: payRunStatus };
    }
    return await this.prisma.payslip.findMany({
      where,
      include: {
        employee: true,
        payRun: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPayslipsByEmployeeId(user: Users, employeeId: number) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    return await this.prisma.payslip.findMany({
      where: {
        employeeId,
        employee: { entrepriseId }
      },
      include: {
        employee: true,
        payRun: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPendingPayslipsCount(user: Users) {
    if (user.role === 'SUPER_ADMIN') {
      return 0; // Super admin n'a pas de tenant spécifique
    }
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    return await this.prisma.payslip.count({
      where: {
        status: 'EN_ATTENTE',
        employee: { entrepriseId }
      }
    });
  }

  async checkPayslipOwnership(payslipId: number, employeeId: number, entrepriseId: number) {
    const payslip = await this.prisma.payslip.findUnique({
      where: { id: payslipId },
      include: { employee: true }
    });

    return payslip && payslip.employee.entrepriseId === entrepriseId && payslip.employeeId === employeeId;
  }
}
