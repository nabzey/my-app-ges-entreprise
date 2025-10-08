import { Users } from '@prisma/client';
export declare class PayslipsService {
    private prisma;
    constructor();
    generatePayslipPdf(payslipId: number, user: Users): Promise<Buffer<ArrayBufferLike>>;
    getPayslips(user: Users, status?: string, payRunId?: number, payRunStatus?: string): Promise<({
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
    })[]>;
    getPayslipsByEmployeeId(user: Users, employeeId: number): Promise<({
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
    })[]>;
    getPendingPayslipsCount(user: Users): Promise<number>;
    checkPayslipOwnership(payslipId: number, employeeId: number, entrepriseId: number): Promise<boolean | null>;
}
//# sourceMappingURL=PayslipsService.d.ts.map