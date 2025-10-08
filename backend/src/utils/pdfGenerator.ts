import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PrismaClient } from '@prisma/client';

pdfMake.vfs = pdfFonts.vfs;

export class PDFGenerator {
  private static prisma: PrismaClient = new PrismaClient();

  static async generatePayslipPDF(payslipId: number, entrepriseId: string): Promise<Buffer> {
    const entrepriseIdNum = parseInt(entrepriseId);

    const payslip = await this.prisma.payslip.findUnique({
      where: { id: payslipId },
      include: {
        employee: true,
        payRun: true,
        payments: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!payslip || payslip.employee.entrepriseId !== entrepriseIdNum) {
      throw new Error('Bulletin non trouvé ou accès non autorisé');
    }

    const totalPaid = payslip.payments.reduce((sum, p) => sum + Number(p.montant), 0);
    const remaining = Number(payslip.net) - totalPaid;

    const docDefinition: any = {
      content: [
        // En-tête avec fond bleu
        {
          text: 'Bulletin de Paie',
          style: 'headerTitle',
          alignment: 'left',
          margin: [40, 30, 0, 20]
        },
        {
          text: `Mois : ${payslip.payRun.periode.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}`,
          style: 'headerMonth',
          alignment: 'right',
          margin: [0, 30, 40, 20]
        },
        // Ligne de séparation
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 515, y2: 0,
              lineWidth: 1,
              lineColor: '#e5e7eb'
            }
          ],
          margin: [40, 0, 40, 20]
        },
        // Informations Employé
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Nom de l\'employé', style: 'infoLabel' },
                { text: payslip.employee.nom, style: 'infoValue', margin: [0, 0, 0, 10] },
                { text: 'Poste', style: 'infoLabel' },
                { text: payslip.employee.poste, style: 'infoValue', margin: [0, 0, 0, 10] }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: 'Matricule', style: 'infoLabel' },
                { text: payslip.employee.id.toString(), style: 'infoValue', margin: [0, 0, 0, 10] },
                { text: 'Département', style: 'infoLabel' },
                { text: payslip.employee.poste, style: 'infoValue', margin: [0, 0, 0, 10] }
              ]
            }
          ],
          margin: [40, 0, 40, 20]
        },
        // Ligne de séparation
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 515, y2: 0,
              lineWidth: 1,
              lineColor: '#e5e7eb'
            }
          ],
          margin: [40, 0, 40, 20]
        },
        // Détails du Salaire
        { text: 'Détails du Salaire', style: 'sectionTitle', margin: [40, 0, 40, 10] },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Description', style: 'tableHeader' },
                { text: 'Montant (FCFA)', style: 'tableHeader', alignment: 'right' }
              ],
              [
                { text: 'Salaire de base', style: 'tableCell' },
                { text: Number(payslip.brut).toLocaleString(), style: 'tableCell', alignment: 'right' }
              ],
              [
                { text: 'Prime', style: 'tableCell' },
                { text: '0', style: 'tableCell', alignment: 'right' }
              ],
              [
                { text: 'Heures Supplémentaires', style: 'tableCell' },
                { text: '0', style: 'tableCell', alignment: 'right' }
              ],
              [
                { text: 'Salaire Brut', style: 'tableCellBold' },
                { text: Number(payslip.brut).toLocaleString(), style: 'tableCellBold', alignment: 'right' }
              ],
              [
                { text: 'Retenues', style: 'tableCellRed' },
                { text: `-${Number(payslip.deductions).toLocaleString()}`, style: 'tableCellRed', alignment: 'right' }
              ],
              [
                { text: 'Salaire Net à Payer', style: 'tableCellGreen' },
                { text: Number(payslip.net).toLocaleString(), style: 'tableCellGreen', alignment: 'right' }
              ]
            ]
          },
          margin: [40, 0, 40, 20]
        },
        // Historique des paiements
        { text: 'Historique des Paiements', style: 'sectionTitle', margin: [40, 0, 40, 10] },
        {
          table: {
            widths: ['auto', '*', 'auto'],
            body: [
              [
                { text: 'Date', style: 'tableHeader' },
                { text: 'Mode', style: 'tableHeader' },
                { text: 'Montant', style: 'tableHeader', alignment: 'right' }
              ],
              ...payslip.payments.map(payment => [
                { text: payment.date.toLocaleDateString('fr-FR'), style: 'tableCell' },
                { text: payment.mode.replace('_', ' '), style: 'tableCell' },
                { text: `${Number(payment.montant).toLocaleString()} XOF`, style: 'tableCell', alignment: 'right' }
              ])
            ]
          },
          margin: [40, 0, 40, 20]
        },
        // Résumé
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Total payé', style: 'summaryLabel' },
                { text: `${totalPaid.toLocaleString()} XOF`, style: 'summaryValue' }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: 'Restant à payer', style: 'summaryLabel' },
                { text: `${remaining.toLocaleString()} XOF`, style: 'summaryValue' }
              ]
            }
          ],
          margin: [40, 0, 40, 20]
        },
        // Statut
        {
          text: `Statut: ${payslip.status}`,
          style: 'status',
          alignment: 'center',
          margin: [40, 0, 40, 20]
        },
        // Signatures
        {
          columns: [
            {
              text: 'Signature employé',
              style: 'signature',
              alignment: 'left',
              margin: [40, 40, 0, 0]
            },
            {
              text: 'Signature entreprise',
              style: 'signature',
              alignment: 'right',
              margin: [0, 40, 40, 0]
            }
          ]
        },
        // Pied de page
        {
          text: `Émis par : Service RH | Date : ${new Date().toLocaleDateString('fr-FR')}`,
          style: 'footer',
          alignment: 'center',
          margin: [40, 20, 40, 20]
        }
      ],
      styles: {
        headerTitle: {
          fontSize: 24,
          bold: true,
          color: '#ffffff'
        },
        headerMonth: {
          fontSize: 12,
          color: '#ffffff'
        },
        infoLabel: {
          fontSize: 10,
          color: '#6b7280'
        },
        infoValue: {
          fontSize: 14,
          bold: true
        },
        sectionTitle: {
          fontSize: 16,
          bold: true,
          color: '#374151'
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          fillColor: '#f3f4f6',
          color: '#374151'
        },
        tableCell: {
          fontSize: 9,
          color: '#374151'
        },
        tableCellBold: {
          fontSize: 9,
          bold: true,
          fillColor: '#f3f4f6',
          color: '#374151'
        },
        tableCellRed: {
          fontSize: 9,
          color: '#dc2626'
        },
        tableCellGreen: {
          fontSize: 9,
          bold: true,
          color: '#16a34a',
          fillColor: '#f0fdf4'
        },
        summaryLabel: {
          fontSize: 10,
          color: '#6b7280'
        },
        summaryValue: {
          fontSize: 12,
          bold: true
        },
        status: {
          fontSize: 12,
          bold: true,
          color: payslip.status === 'PAYE' ? '#16a34a' : payslip.status === 'PARTIEL' ? '#d97706' : '#dc2626'
        },
        signature: {
          fontSize: 10,
          italics: true
        },
        footer: {
          fontSize: 8,
          color: '#6b7280'
        }
      },
      background: function(currentPage: any, pageSize: any) {
        return {
          canvas: [
            // Fond bleu pour l'en-tête
            {
              type: 'rect',
              x: 0, y: 0,
              w: pageSize.width, h: 100,
              color: '#2563eb'
            }
          ]
        };
      }
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
  }

  static async generatePaymentReceiptPDF(paymentId: number, entrepriseId: string): Promise<Buffer> {
    const entrepriseIdNum = parseInt(entrepriseId);

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        payslip: {
          include: {
            employee: true,
            payRun: true
          }
        }
      }
    });

    if (!payment || payment.payslip.employee.entrepriseId !== entrepriseIdNum) {
      throw new Error('Paiement non trouvé ou accès non autorisé');
    }

    const docDefinition: any = {
      content: [
        { text: 'REÇU DE PAIEMENT', style: 'header', alignment: 'center' },
        { text: '\n' },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Numéro de reçu:', style: 'label' },
                { text: `PAY-${payment.id.toString().padStart(6, '0')}`, style: 'value' }
              ],
              [
                { text: 'Date:', style: 'label' },
                { text: payment.date.toLocaleDateString('fr-FR'), style: 'value' }
              ],
              [
                { text: 'Employé:', style: 'label' },
                { text: payment.payslip.employee.nom, style: 'value' }
              ],
              [
                { text: 'Poste:', style: 'label' },
                { text: payment.payslip.employee.poste, style: 'value' }
              ],
              [
                { text: 'Période:', style: 'label' },
                { text: `${payment.payslip.payRun.periode.toLocaleDateString('fr-FR')} (${payment.payslip.payRun.type})`, style: 'value' }
              ],
              [
                { text: 'Mode de paiement:', style: 'label' },
                { text: payment.mode.replace('_', ' '), style: 'value' }
              ]
            ]
          },
          layout: 'noBorders'
        },
        { text: '\n\n' },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Montant payé:', style: 'amountLabel' },
                { text: `${Number(payment.montant).toLocaleString()} XOF`, style: 'amountValue' }
              ]
            ]
          },
          layout: 'noBorders'
        },
        { text: '\n\n' },
        {
          text: 'Ce reçu atteste du paiement effectué.',
          style: 'confirmation',
          alignment: 'center'
        },
        { text: '\n\n\n' },
        {
          columns: [
            {
              text: 'Signature employé',
              style: 'signature',
              alignment: 'left'
            },
            {
              text: 'Signature entreprise',
              style: 'signature',
              alignment: 'right'
            }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 20]
        },
        label: {
          fontSize: 10,
          color: '#666'
        },
        value: {
          fontSize: 10,
          bold: true
        },
        amountLabel: {
          fontSize: 14,
          bold: true,
          color: '#22c55e'
        },
        amountValue: {
          fontSize: 16,
          bold: true,
          color: '#22c55e'
        },
        confirmation: {
          fontSize: 12,
          italics: true
        },
        signature: {
          fontSize: 10,
          italics: true,
          margin: [0, 40, 0, 0]
        }
      }
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
  }
}