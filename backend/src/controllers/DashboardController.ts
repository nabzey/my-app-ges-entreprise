import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
  private service = new DashboardService();

  async getDashboard(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(400).json({ message: 'Utilisateur non authentifié' });

      const data = await this.service.getDashboardData(req.user as any);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
