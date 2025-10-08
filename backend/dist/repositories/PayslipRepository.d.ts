import { Payslip, StatusPayslip } from '@prisma/client';
export declare class PayslipRepository {
    private prisma;
    constructor();
    create(data: {
        employeeId: number;
        payRunId: number;
        brut: number;
        deductions?: number;
        net: number;
        status?: StatusPayslip;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.StatusPayslip;
        employeeId: number;
        brut: import("@prisma/client/runtime/library").Decimal;
        deductions: import("@prisma/client/runtime/library").Decimal;
        net: import("@prisma/client/runtime/library").Decimal;
        payRunId: number;
    }>;
    findAll(filters: {
        payRunId?: number;
        employeeId?: number;
        entrepriseId?: number;
    }): Promise<({
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
    findById(id: number): Promise<({
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
    }) | null>;
    update(id: number, data: Partial<Payslip>): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.StatusPayslip;
        employeeId: number;
        brut: import("@prisma/client/runtime/library").Decimal;
        deductions: import("@prisma/client/runtime/library").Decimal;
        net: import("@prisma/client/runtime/library").Decimal;
        payRunId: number;
    }>;
    delete(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.StatusPayslip;
        employeeId: number;
        brut: import("@prisma/client/runtime/library").Decimal;
        deductions: import("@prisma/client/runtime/library").Decimal;
        net: import("@prisma/client/runtime/library").Decimal;
        payRunId: number;
    }>;
    getByPayRun(payRunId: number): Promise<({
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
    })[]>;
}
//# sourceMappingURL=PayslipRepository.d.ts.map