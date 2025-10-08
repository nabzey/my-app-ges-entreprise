import { PayRunRepository } from '../repositories/PayRunRepository';
import { PrismaClient } from '@prisma/client';
import { StatusPayRun } from '@prisma/client';
import { Users } from '@prisma/client';

export class PayRunService {
  private repo = new PayRunRepository();
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: { periode: Date; type: string; status?: StatusPayRun }, entrepriseId: number) {
    return await this.repo.create({ ...data, entrepriseId });
  }

  async findAll(entrepriseId: number) {
    return await this.repo.findAll(entrepriseId);
  }

  async findById(id: number) {
    return await this.repo.findById(id);
  }

  async updateStatus(id: number, status: StatusPayRun, user: Users) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    // Validation du workflow
    const payRun = await this.repo.findById(id);
    if (!payRun) throw new Error('PayRun non trouvé');

    if (payRun.entrepriseId !== entrepriseId) {
      throw new Error('Accès non autorisé à ce cycle de paie');
    }

    // Vérifier les transitions autorisées
    if (payRun.status === 'CLOTURE') {
      throw new Error('PayRun clôturé ne peut plus être modifié');
    }

    if (status === 'BROUILLON' && payRun.status !== 'BROUILLON') {
      throw new Error('Impossible de revenir au statut BROUILLON');
    }

    if (status === 'APPROUVE' && payRun.status !== 'BROUILLON') {
      throw new Error('Seul un PayRun en BROUILLON peut être approuvé');
    }

    if (status === 'CLOTURE' && payRun.status !== 'APPROUVE') {
      throw new Error('Seul un PayRun approuvé peut être clôturé');
    }

    return await this.repo.update(id, { status });
  }

  async approvePayRun(id: number, user: Users) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    const payRun = await this.updateStatus(id, 'APPROUVE', user);

    // Mettre à jour le statut des bulletins de paie associés
    await this.prisma.payslip.updateMany({
      where: {
        payRunId: id,
        status: 'EN_ATTENTE',
        employee: { entrepriseId }
      },
      data: { status: 'PARTIEL' } // Ils deviennent partiels car peuvent encore recevoir des paiements
    });

    return payRun;
  }

  async closePayRun(id: number, user: Users) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    const payRun = await this.updateStatus(id, 'CLOTURE', user);

    // Finaliser les bulletins de paie - ceux sans paiement deviennent PAYE
    const payslips = await this.prisma.payslip.findMany({
      where: { payRunId: id, employee: { entrepriseId } },
      include: { payments: true }
    });

    for (const payslip of payslips) {
      const totalPaid = payslip.payments.reduce((sum, p) => sum + Number(p.montant), 0);
      if (totalPaid >= Number(payslip.net)) {
        await this.prisma.payslip.update({
          where: { id: payslip.id },
          data: { status: 'PAYE' }
        });
      } else if (totalPaid > 0) {
        await this.prisma.payslip.update({
          where: { id: payslip.id },
          data: { status: 'PARTIEL' }
        });
      } else {
        // Si aucun paiement, marquer comme PAYE (cycle clôturé)
        await this.prisma.payslip.update({
          where: { id: payslip.id },
          data: { status: 'PAYE' }
        });
      }
    }

    return payRun;
  }

  async getPayRunsByStatus(status: StatusPayRun, entrepriseId: number) {
    return await this.repo.findByStatus(status, entrepriseId);
  }

  async getPayRunsByPeriod(year: number, month: number, entrepriseId: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return await this.repo.findByPeriod(startDate, endDate, entrepriseId);
  }
}
