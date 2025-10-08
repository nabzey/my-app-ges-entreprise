export declare class DashboardRepository {
    private prisma;
    constructor();
    getKPIs(entrepriseId: number): Promise<{
        activeEmployees: number;
        totalSalary: number | import("@prisma/client/runtime/library").Decimal;
        totalPaid: number | import("@prisma/client/runtime/library").Decimal;
        remainingAmount: number | import("@prisma/client/runtime/library").Decimal;
    }>;
    getSalaryEvolution(entrepriseId: number): Promise<{
        month: Date;
        totalSalary: number;
    }[]>;
    getUpcomingPayments(entrepriseId: number): Promise<{
        id: number;
        employeeName: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date;
        status: import("@prisma/client").$Enums.StatusPayslip;
    }[]>;
}
//# sourceMappingURL=DashboardRepository.d.ts.map