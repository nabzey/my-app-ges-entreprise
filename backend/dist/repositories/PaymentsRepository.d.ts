import { Payment } from '@prisma/client';
export declare class PaymentsRepository {
    private prisma;
    constructor();
    create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        mode: import("@prisma/client").$Enums.ModePaiement;
        montant: import("@prisma/client/runtime/library").Decimal;
        payslipId: number;
    }>;
    findAll(entrepriseId?: number): Promise<({
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
    findById(id: number): Promise<({
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
    }) | null>;
    update(id: number, data: Partial<Payment>): Promise<{
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
    }>;
    delete(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        mode: import("@prisma/client").$Enums.ModePaiement;
        montant: import("@prisma/client/runtime/library").Decimal;
        payslipId: number;
    }>;
    findByPayslipId(payslipId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        mode: import("@prisma/client").$Enums.ModePaiement;
        montant: import("@prisma/client/runtime/library").Decimal;
        payslipId: number;
    }[]>;
    findByEmployeeId(employeeId: number): Promise<({
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
}
//# sourceMappingURL=PaymentsRepository.d.ts.map