import { Users } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    constructor();
    recordPayment(paymentData: any, user: Users): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        mode: import("@prisma/client").$Enums.ModePaiement;
        montant: import("@prisma/client/runtime/library").Decimal;
        payslipId: number;
    }>;
    getPayments(user: Users): Promise<({
        payslip: {
            employee: {
                id: number;
                nom: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                password: string | null;
                entrepriseId: number;
                poste: string;
                typeContrat: import("@prisma/client").$Enums.TypeContrat;
                tauxSalaire: import("@prisma/client/runtime/library").Decimal;
                joursTravailles: number | null;
                coordonneesBancaires: string | null;
                qrCode: string | null;
                confirmationCode: string | null;
                actif: boolean;
            };
            payRun: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                entrepriseId: number;
                periode: Date;
                type: string;
                status: import("@prisma/client").$Enums.StatusPayRun;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.StatusPayslip;
            employeeId: number;
            brut: import("@prisma/client/runtime/library").Decimal;
            deductions: import("@prisma/client/runtime/library").Decimal;
            net: import("@prisma/client/runtime/library").Decimal;
            payRunId: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        mode: import("@prisma/client").$Enums.ModePaiement;
        montant: import("@prisma/client/runtime/library").Decimal;
        payslipId: number;
    })[]>;
    generatePaymentReceiptPdf(paymentId: number, user: Users): Promise<Buffer<ArrayBufferLike>>;
}
//# sourceMappingURL=PaymentsService.d.ts.map