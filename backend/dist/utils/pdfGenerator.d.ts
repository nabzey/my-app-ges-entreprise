export declare class PDFGenerator {
    private static prisma;
    static generatePayslipPDF(payslipId: number, entrepriseId: string): Promise<Buffer>;
    static generatePaymentReceiptPDF(paymentId: number, entrepriseId: string): Promise<Buffer>;
}
//# sourceMappingURL=pdfGenerator.d.ts.map