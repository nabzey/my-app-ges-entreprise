import { Request, Response } from 'express';
import { PayslipsService } from '../services/PayslipsService';
import { Users } from '@prisma/client';

const service = new PayslipsService();

export class PayslipsController {
  async getPayslips(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
      if (user.role === 'SUPER_ADMIN') {
        return res.status(200).json({ message: 'Bulletins récupérés', data: [] });
      }

      const status = req.query.status as string;
      const payRunId = req.query.payRunId ? parseInt(req.query.payRunId as string, 10) : undefined;
      const payRunStatus = req.query.payRunStatus as string;
      const payslips = await service.getPayslips(user, status, payRunId, payRunStatus);
      res.status(200).json({ message: 'Bulletins récupérés', data: payslips });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPayslipsByEmployee(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
      if (user.role === 'SUPER_ADMIN') {
        return res.status(200).json({ message: 'Bulletins récupérés pour l\'employé', data: [] });
      }

      const employeeId = parseInt(req.params.employeeId || '', 10);
      if (isNaN(employeeId)) {
        return res.status(400).json({ message: 'ID d\'employé invalide' });
      }
      const payslips = await service.getPayslipsByEmployeeId(user, employeeId);
      res.status(200).json({ message: 'Bulletins récupérés pour l\'employé', data: payslips });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async downloadPayslipPdf(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
      if (user.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const payslipId = parseInt(req.params.id || '', 10);
      if (isNaN(payslipId)) {
        return res.status(400).json({ message: 'ID de bulletin invalide' });
      }
      const pdfBuffer = await service.generatePayslipPdf(payslipId, user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payslip_${payslipId}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async downloadMyPayslipPdf(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // Vérifier que c'est un employé
      if (user.role !== 'EMPLOYEE') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const payslipId = parseInt(req.params.id || '', 10);
      if (isNaN(payslipId)) {
        return res.status(400).json({ message: 'ID de bulletin invalide' });
      }

      const entrepriseId = user.entrepriseId;
      if (!entrepriseId) {
        return res.status(400).json({ message: 'Entreprise non sélectionnée' });
      }

      // Vérifier que le bulletin appartient à l'employé
      const hasAccess = await service.checkPayslipOwnership(payslipId, (user as any).employeeId, entrepriseId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Accès non autorisé à ce bulletin' });
      }

      const pdfBuffer = await service.generatePayslipPdf(payslipId, user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payslip_${payslipId}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPendingPayslipsCount(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const count = await service.getPendingPayslipsCount(user);
      res.status(200).json({ message: 'Nombre de bulletins en attente récupéré', data: count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
