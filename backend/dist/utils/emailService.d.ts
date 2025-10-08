export declare class EmailService {
    private transporter;
    constructor();
    sendConfirmationEmail(email: string, code: string, employeeName: string): Promise<void>;
    sendWelcomeEmail(email: string, password: string, qrCode: string, employeeName: string): Promise<void>;
}
//# sourceMappingURL=emailService.d.ts.map