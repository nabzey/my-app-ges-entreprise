export declare class QRCodeGenerator {
    static generateQRCodeText(employeeId: number, employeeName: string): string;
    static validateQRCode(qrData: string): {
        employeeId: number;
        name: string;
    } | null;
}
//# sourceMappingURL=qrCodeGenerator.d.ts.map