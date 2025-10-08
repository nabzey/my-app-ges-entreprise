import { PrismaClient } from '@prisma/client';
import { Users } from '@prisma/client';
import { PDFGenerator } from '../utils/pdfGenerator';

export class PaymentsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async recordPayment(paymentData: any, user: Users) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    const { payslipId, montant, mode, date } = paymentData;

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        payslipId,
        montant: Number(montant),
        mode,
        date: new Date(date),
      },
    });

    // Get payslip
    const payslip = await this.prisma.payslip.findUnique({
      where: { id: payslipId },
      include: { payments: true, employee: true },
    });

    if (!payslip) {
      throw new Error('Bulletin de paie non trouvé');
    }

    if (payslip.employee.entrepriseId !== entrepriseId) {
      throw new Error('Accès non autorisé à ce bulletin de paie');
    }

    // Calculate current total paid (before this payment)
    const currentTotalPaid = payslip.payments.reduce((sum: number, p: any) => sum + Number(p.montant), 0);

    // Validate payment amount doesn't exceed remaining balance
    const remainingAmount = Number(payslip.net) - currentTotalPaid;
    if (Number(montant) > remainingAmount) {
      throw new Error(`Montant du paiement (${Number(montant).toLocaleString()} XOF) dépasse le solde restant (${remainingAmount.toLocaleString()} XOF)`);
    }

    // Calculate new total paid (after this payment)
    const newTotalPaid = currentTotalPaid + Number(montant);

    // Update payslip status
    let newStatus = 'EN_ATTENTE';
    if (newTotalPaid >= Number(payslip.net)) {
      newStatus = 'PAYE';
    } else if (newTotalPaid > 0) {
      newStatus = 'PARTIEL';
    }

    await this.prisma.payslip.update({
      where: { id: payslipId },
      data: { status: newStatus as any },
    });

    return payment;
  }

  async getPayments(user: Users) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    return await this.prisma.payment.findMany({
      where: {
        payslip: {
          employee: { entrepriseId }
        }
      },
      include: {
        payslip: {
          include: {
            employee: true,
            payRun: true,
          },
        },
      },
    });
  }

  async generatePaymentReceiptPdf(paymentId: number, user: Users) {
    const entrepriseId = user.entrepriseId;
    if (!entrepriseId) {
      throw new Error('Entreprise non sélectionnée');
    }

    // Vérifier que le paiement appartient à l'entreprise de l'utilisateur
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        payslip: {
          include: { employee: true }
        }
      }
    });

    if (!payment || payment.payslip.employee.entrepriseId !== entrepriseId) {
      throw new Error('Paiement non trouvé ou accès non autorisé');
    }

    return await PDFGenerator.generatePaymentReceiptPDF(paymentId, entrepriseId.toString());
  }
}
