import { Pointage, TypePointage } from '@prisma/client';
import { Users } from '@prisma/client';
export declare class PointageService {
    private repo;
    create(pointageData: {
        employeeId: number;
        type: TypePointage;
        heure?: Date;
    }, user: Users): Promise<Pointage>;
    getLastPointageTimeForEmployees(user: Users): Promise<{
        employeeId: number;
        lastPointage: Date | null;
    }[]>;
    findById(id: number, user: Users): Promise<Pointage | null>;
    findAll(filters: {
        employeeId?: number;
        date?: Date;
        dateDebut?: Date;
        dateFin?: Date;
        type?: TypePointage;
    }, user: Users): Promise<Pointage[]>;
    findByEmployeeAndDate(employeeId: number, date: Date, user: Users): Promise<Pointage[]>;
    calculateWorkedHours(employeeId: number, month: number, year: number, user: Users): Promise<number>;
    getEmployeeAttendanceSummary(employeeId: number, month: number, year: number, user: Users): Promise<{
        totalWorkedHours: number;
        totalWorkedDays: number;
        averageHoursPerDay: number;
        attendanceRate: number;
    }>;
    private getWorkingDaysInMonth;
    update(id: number, data: Partial<{
        type: TypePointage;
        heure: Date;
    }>, user: Users): Promise<Pointage>;
    delete(id: number, user: Users): Promise<Pointage>;
    private updateAttendanceRecord;
    markAbsencesForDate(date: Date, user: Users): Promise<void>;
}
//# sourceMappingURL=PointageService.d.ts.map