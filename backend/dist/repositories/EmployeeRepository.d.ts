import { Employee, TypeContrat } from '@prisma/client';
export declare class EmployeeRepository {
    private prisma;
    constructor();
    create(employeeData: {
        nom: string;
        email: string;
        poste: string;
        typeContrat: TypeContrat;
        tauxSalaire: number;
        coordonneesBancaires: string | null;
        actif: boolean;
        joursTravailles?: number | null;
        confirmationCode?: string | null;
        entrepriseId: number;
    }): Promise<Employee>;
    findAll(filters?: {
        poste?: string;
        typeContrat?: TypeContrat;
        actif?: boolean;
        entrepriseId?: number;
    }): Promise<Employee[]>;
    findById(id: number): Promise<Employee | null>;
    update(id: number, data: Partial<Omit<Employee, 'id'>>): Promise<Employee>;
    delete(id: number): Promise<Employee>;
    findByEmail(email: string): Promise<Employee | null>;
}
//# sourceMappingURL=EmployeeRepository.d.ts.map