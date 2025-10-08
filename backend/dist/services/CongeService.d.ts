import { CongeRequest, TypeConge, StatusConge } from '@prisma/client';
export declare class CongeService {
    private repo;
    private emailService;
    private readonly CONGE_ANNUEL_LIMIT;
    private readonly CONGE_MALADIE_LIMIT;
    createCongeRequest(data: {
        employeeId: number;
        typeConge: TypeConge;
        dateDebut: Date;
        dateFin: Date;
        motif?: string;
    }): Promise<CongeRequest>;
    getAllCongeRequests(filters?: {
        employeeId?: number;
        status?: StatusConge;
        typeConge?: TypeConge;
        entrepriseId?: number;
    }): Promise<CongeRequest[]>;
    getCongeRequestById(id: number): Promise<CongeRequest | null>;
    approveCongeRequest(id: number, commentaireRH?: string): Promise<CongeRequest>;
    rejectCongeRequest(id: number, commentaireRH: string): Promise<CongeRequest>;
    cancelCongeRequest(id: number, employeeId: number): Promise<CongeRequest>;
    getCongeBalance(employeeId: number): Promise<{
        congesAnnuels: {
            utilises: number;
            restants: number;
            total: number;
        };
        congesMaladie: {
            utilises: number;
            restants: number;
            total: number;
        };
        congesEnAttente: number;
    }>;
    private calculateWorkDays;
}
//# sourceMappingURL=CongeService.d.ts.map