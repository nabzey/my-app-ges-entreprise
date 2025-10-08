import { Request, Response } from 'express';
import { PaymentsService } from '../services/PaymentsService';
import { Users } from '@prisma/client';

const service = new PaymentsService();

export class PaymentsController {
  async recordPayment(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas enregistrer de paiements tenant
      if (user.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Action non autorisée pour ce type d\'utilisateur' });
      }

      const paymentData = req.body;
      const payment = await service.recordPayment(paymentData, user);
      res.status(201).json({ message: 'Paiement enregistré', data: payment });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPayments(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
      if (user.role === 'SUPER_ADMIN') {
        return res.status(200).json({ message: 'Paiements récupérés', data: [] });
      }

      const payments = await service.getPayments(user);
      res.status(200).json({ message: 'Paiements récupérés', data: payments });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async downloadPaymentReceipt(req: Request, res: Response) {
    try {
      const user = req.user as Users;

      // SUPER_ADMIN ne peut pas accéder aux données tenant spécifiques
      if (user.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const paymentId = parseInt(req.params.id ?? '', 10);
      if (isNaN(paymentId)) {
        return res.status(400).json({ message: 'ID de paiement invalide' });
      }
      const pdfBuffer = await service.generatePaymentReceiptPdf(paymentId, user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payment_receipt_${paymentId}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
