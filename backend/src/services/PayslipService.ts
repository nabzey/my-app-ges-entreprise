import { PayslipRepository } from '../repositories/PayslipRepository';
import { PrismaClient } from '@prisma/client';
import { StatusPayslip } from '@prisma/client';
import { Users } from '@prisma/client';

export class PayslipService {
  private repo = new PayslipRepository();
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
    return await this.repo.create(data);
  }

  async findAll(filters: { payRunId?: number; employeeId?: number; entrepriseId?: number }) {
    return await this.repo.findAll(filters);
  }

  async findById(id: number) {
    return await this.repo.findById(id);
  }

  async update(id: number, data: Partial<any>) {
    return await this.repo.update(id, data);
  }

  async delete(id: number) {
    return await this.repo.delete(id);
  }

  async getByPayRun(payRunId: number) {
    return await this.repo.getByPayRun(payRunId);
  }

  async updateStatus(id: number, status: StatusPayslip, user: Users) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    // Vérifier que le payslip appartient à l'entreprise de l'utilisateur
    const payslip = await this.repo.findById(id);
    if (!payslip) {
      throw new Error('Bulletin de paie non trouvé');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: payslip.employeeId }
    });

    if (!employee || employee.entrepriseId !== entrepriseId) {
      throw new Error('Accès non autorisé à ce bulletin de paie');
    }

    return await this.repo.update(id, { status });
  }

  async generateMonthlyPayslips(entrepriseId: number, periode?: string) {
    // Déterminer la période (mois en cours par défaut)
    const targetDate = periode ? new Date(periode + '-01') : new Date();
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    // Vérifier si un PayRun existe déjà pour cette période et entreprise
    let payRun = await this.prisma.payRun.findFirst({
      where: {
        periode: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        type: "MENSUEL",
        entrepriseId
      }
    });

    if (!payRun) {
      payRun = await this.prisma.payRun.create({
        data: {
          periode: startOfMonth,
          type: "MENSUEL",
          status: "BROUILLON",
          entrepriseId
        }
      });
    } else if (payRun.status !== "BROUILLON") {
      throw new Error(`PayRun déjà ${payRun.status.toLowerCase()} pour cette période`);
    }

    // Récupérer tous les employés actifs de l'entreprise
    const employees = await this.prisma.employee.findMany({
      where: { actif: true, entrepriseId }
    });

    const payslips = [];
    for (const employee of employees) {
      // Vérifier l'unicité : 1 bulletin par employé/mois
      const existingPayslip = await this.prisma.payslip.findFirst({
        where: {
          employeeId: employee.id,
          payRunId: payRun.id
        }
      });

      if (existingPayslip) {
        continue; // Bulletin déjà créé pour cet employé ce mois
      }

      // Calculs salariaux selon le type de contrat
      let brut = 0;
      let deductions = 0;

      if (employee.typeContrat === 'FIXE') {
        brut = Number(employee.tauxSalaire);
        // Déductions : CNSS (5.5%), IGR (varie selon salaire), etc.
        deductions = this.calculateDeductions(brut);
      } else if (employee.typeContrat === 'JOURNALIER') {
        const joursTravaillees = employee.joursTravailles || 0;
        const salaireJournalier = Number(employee.tauxSalaire);
        brut = salaireJournalier * joursTravaillees;
        deductions = this.calculateDeductions(brut);
      } else if (employee.typeContrat === 'HONORAIRE') {
        brut = Number(employee.tauxSalaire);
        // Pour honoraires, déductions minimales
        deductions = brut * 0.1; // 10% retenue à la source
      }

      const net = Math.max(0, brut - deductions);

      const payslip = await this.prisma.payslip.create({
        data: {
          employeeId: employee.id,
          payRunId: payRun.id,
          brut: brut,
          deductions: deductions,
          net: net,
          status: 'EN_ATTENTE'
        },
        include: {
          employee: true,
          payRun: true
        }
      });

      payslips.push(payslip);
    }

    return { payRun, payslips };
  }

  private calculateDeductions(brut: number): number {
    let deductions = 0;

    // CNSS (Caisse Nationale de Sécurité Sociale) - 5.5%
    const cnss = brut * 0.055;
    deductions += cnss;

    // IGR (Impôt Général sur le Revenu) - barème simplifié
    let igr = 0;
    const salaireAnnuel = brut * 12;

    if (salaireAnnuel > 2400000) { // > 2.4M XOF/an
      igr = (salaireAnnuel - 2400000) * 0.4 + 600000 * 0.35 + 600000 * 0.25 + 600000 * 0.15;
    } else if (salaireAnnuel > 1800000) { // 1.8M - 2.4M
      igr = (salaireAnnuel - 1800000) * 0.35 + 600000 * 0.25 + 600000 * 0.15;
    } else if (salaireAnnuel > 1200000) { // 1.2M - 1.8M
      igr = (salaireAnnuel - 1200000) * 0.25 + 600000 * 0.15;
    } else if (salaireAnnuel > 600000) { // 600k - 1.2M
      igr = (salaireAnnuel - 600000) * 0.15;
    }

    deductions += igr / 12; // IGR mensuel

    return deductions;
  }
}
