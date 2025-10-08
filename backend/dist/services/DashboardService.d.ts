import { Users } from '@prisma/client';
export declare class DashboardService {
    private repo;
    getDashboardData(user: Users): Promise<{
        kpis: {
            activeEmployees: number;
            totalSalary: number | import("@prisma/client/runtime/library").Decimal;
            totalPaid: number | import("@prisma/client/runtime/library").Decimal;
            remainingAmount: number | import("@prisma/client/runtime/library").Decimal;
        };
        salaryEvolution: {
            month: Date;
            totalSalary: number;
        }[];
        upcomingPayments: {
            id: number;
            employeeName: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            dueDate: Date;
            status: import("@prisma/client").$Enums.StatusPayslip;
        }[];
    }>;
}
//# sourceMappingURL=DashboardService.d.ts.map