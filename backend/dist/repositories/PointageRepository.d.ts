import { PrismaClient, Pointage, TypePointage } from '@prisma/client';
export declare class PointageRepository {
    prisma: PrismaClient;
    constructor();
    create(pointageData: {
        employeeId: number;
        date: Date;
        type: TypePointage;
        heure: Date;
        entrepriseId: number;
    }): Promise<Pointage>;
    findAll(filters?: {
        employeeId?: number;
        date?: Date;
        dateDebut?: Date;
        dateFin?: Date;
        type?: TypePointage;
        entrepriseId?: number;
    }): Promise<Pointage[]>;
    getLastPointageTimeForEmployees(entrepriseId: number): Promise<{
        employeeId: number;
        lastPointage: Date | null;
    }[]>;
    findById(id: number): Promise<Pointage | null>;
    findByEmployeeAndDate(employeeId: number, date: Date): Promise<Pointage[]>;
    update(id: number, data: Partial<Omit<Pointage, 'id'>>): Promise<Pointage>;
    delete(id: number): Promise<Pointage>;
    calculateWorkedHours(employeeId: number, month: number, year: number): Promise<number>;
}
//# sourceMappingURL=PointageRepository.d.ts.map