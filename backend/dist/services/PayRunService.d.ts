import { StatusPayRun } from '@prisma/client';
import { Users } from '@prisma/client';
export declare class PayRunService {
    private repo;
    private prisma;
    constructor();
    create(data: {
        periode: Date;
        type: string;
        status?: StatusPayRun;
    }, entrepriseId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        entrepriseId: number;
        periode: Date;
        type: string;
        status: import("@prisma/client").$Enums.StatusPayRun;
    }>;
    findAll(entrepriseId: number): Promise<({
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
    findById(id: number): Promise<({
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
    }) | null>;
    updateStatus(id: number, status: StatusPayRun, user: Users): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        entrepriseId: number;
        periode: Date;
        type: string;
        status: import("@prisma/client").$Enums.StatusPayRun;
    }>;
    approvePayRun(id: number, user: Users): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        entrepriseId: number;
        periode: Date;
        type: string;
        status: import("@prisma/client").$Enums.StatusPayRun;
    }>;
    closePayRun(id: number, user: Users): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        entrepriseId: number;
        periode: Date;
        type: string;
        status: import("@prisma/client").$Enums.StatusPayRun;
    }>;
    getPayRunsByStatus(status: StatusPayRun, entrepriseId: number): Promise<({
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
    getPayRunsByPeriod(year: number, month: number, entrepriseId: number): Promise<({
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
}
//# sourceMappingURL=PayRunService.d.ts.map