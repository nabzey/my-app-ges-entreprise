import { Request, Response } from 'express';
import { PayRunsService } from '../services/PayRunsService';
import { Users } from '@prisma/client';

const service = new PayRunsService();

export class PayRunsController {
  async generateMonthlyPayRuns(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas générer de bulletins tenant
      if (user.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Action non autorisée pour ce type d\'utilisateur' });
      }

      let { period } = req.body || {};

      // Si pas de période fournie, utiliser le mois en cours
      if (!period) {
        const now = new Date();
        period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }

      const result = await service.generateMonthlyPayRuns(period, user);
      res.status(200).json({ message: 'Bulletins générés avec succès', data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPayRuns(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
      if (user.role === 'SUPER_ADMIN') {
        return res.status(200).json({ message: 'PayRuns récupérés', data: [] });
      }

      const payRuns = await service.getPayRuns(user);
      res.status(200).json({ message: 'PayRuns récupérés', data: payRuns });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async approvePayRun(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas modifier les cycles tenant
      if (user.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Action non autorisée pour ce type d\'utilisateur' });
      }

      const payRunId = parseInt(req.params.id || '', 10);
      if (isNaN(payRunId)) {
        return res.status(400).json({ message: 'ID de cycle de paie invalide' });
      }
      const updatedPayRun = await service.approvePayRun(payRunId, user);
      res.status(200).json({ message: 'Cycle de paie approuvé', data: updatedPayRun });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async closePayRun(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas modifier les cycles tenant
      if (user.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Action non autorisée pour ce type d\'utilisateur' });
      }

      const payRunId = parseInt(req.params.id || '', 10);
      if (isNaN(payRunId)) {
        return res.status(400).json({ message: 'ID de cycle de paie invalide' });
      }
      const updatedPayRun = await service.closePayRun(payRunId, user);
      res.status(200).json({ message: 'Cycle de paie clôturé', data: updatedPayRun });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
