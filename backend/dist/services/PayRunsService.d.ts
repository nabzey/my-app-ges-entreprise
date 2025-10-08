import { Users } from '@prisma/client';
export declare class PayRunsService {
    private prisma;
    constructor();
    generateMonthlyPayRuns(period: string, user: Users): Promise<{
        payRun: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            entrepriseId: number;
            periode: Date;
            type: string;
            status: import("@prisma/client").$Enums.StatusPayRun;
        };
        payslips: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.StatusPayslip;
            employeeId: number;
            brut: import("@prisma/client/runtime/library").Decimal;
            deductions: import("@prisma/client/runtime/library").Decimal;
            net: import("@prisma/client/runtime/library").Decimal;
            payRunId: number;
        }[];
        count: number;
    }>;
    getPayRuns(user: Users): Promise<({
        payslips: ({
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
            payments: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                date: Date;
                mode: import("@prisma/client").$Enums.ModePaiement;
                montant: import("@prisma/client/runtime/library").Decimal;
                payslipId: number;
            }[];
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
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        entrepriseId: number;
        periode: Date;
        type: string;
        status: import("@prisma/client").$Enums.StatusPayRun;
    })[]>;
    approvePayRun(payRunId: number, user: Users): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        entrepriseId: number;
        periode: Date;
        type: string;
        status: import("@prisma/client").$Enums.StatusPayRun;
    }>;
    closePayRun(payRunId: number, user: Users): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        entrepriseId: number;
        periode: Date;
        type: string;
        status: import("@prisma/client").$Enums.StatusPayRun;
    }>;
}
//# sourceMappingURL=PayRunsService.d.ts.map