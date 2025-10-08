import { CongeRequest, TypeConge, StatusConge } from '@prisma/client';
export declare class CongeRepository {
    private prisma;
    constructor();
    create(data: {
        employeeId: number;
        typeConge: TypeConge;
        dateDebut: Date;
        dateFin: Date;
        motif?: string;
    }): Promise<CongeRequest>;
    findAll(filters?: {
        employeeId?: number;
        status?: StatusConge;
        typeConge?: TypeConge;
        entrepriseId?: number;
    }): Promise<CongeRequest[]>;
    findById(id: number): Promise<CongeRequest | null>;
    update(id: number, data: Partial<{
        status: StatusConge;
        commentaireRH: string | null;
    }>): Promise<CongeRequest>;
    getCongesByEmployee(employeeId: number, year?: number): Promise<CongeRequest[]>;
    countCongesByType(employeeId: number, typeConge: TypeConge, year: number): Promise<number>;
    checkConflict(employeeId: number, dateDebut: Date, dateFin: Date, excludeId?: number): Promise<boolean>;
}
//# sourceMappingURL=CongeRepository.d.ts.map