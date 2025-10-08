import { DashboardRepository } from '../repositories/DashboardRepository';
import { Users } from '@prisma/client';

export class DashboardService {
  private repo = new DashboardRepository();

  async getDashboardData(user: Users) {
    let entrepriseId = user.entrepriseId;

    // Handle case where entrepriseId might be a string (from JWT)
    if (typeof entrepriseId === 'string') {
      entrepriseId = parseInt(entrepriseId);
    }

    if (!entrepriseId || isNaN(entrepriseId)) {
      throw new Error('Entreprise non sélectionnée');
    }

    const kpis = await this.repo.getKPIs(entrepriseId);
    const salaryEvolution = await this.repo.getSalaryEvolution(entrepriseId);
    const upcomingPayments = await this.repo.getUpcomingPayments(entrepriseId);

    return {
      kpis,
      salaryEvolution,
      upcomingPayments
    };
  }
}
