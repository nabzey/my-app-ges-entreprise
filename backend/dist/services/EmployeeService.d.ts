import { Employee, TypeContrat } from '@prisma/client';
export declare class EmployeeService {
    private repo;
    private emailService;
    create(employeeData: {
        nom: string;
        email: string;
        poste: string;
        password?: string | undefined;
        typeContrat: TypeContrat;
        tauxSalaire: number;
        coordonneesBancaires?: string | null;
        actif?: boolean;
        joursTravailles?: number | null;
    }, entrepriseId: number): Promise<Employee>;
    findAll(filters: {
        status?: boolean;
        poste?: string;
        typeContrat?: TypeContrat;
        actif?: boolean;
    }, entrepriseId: number): Promise<Employee[]>;
    findById(id: number): Promise<Employee | null>;
    update(id: number, data: Partial<{
        nom: string;
        poste: string;
        typeContrat: TypeContrat;
        tauxSalaire: number;
        coordonneesBancaires: string | null;
        actif: boolean;
        joursTravailles: number | null;
    }>): Promise<Employee>;
    delete(id: number): Promise<Employee>;
    toggleActif(id: number): Promise<Employee>;
    confirmCode(employeeId: number, code: string): Promise<Employee | null>;
    login(email: string, password: string): Promise<{
        user: {
            id: number;
            email: string;
            nom: string;
            poste: string;
            role: string;
            qrCode: string | null;
            entreprise: {
                id: any;
                nom: any;
                adresse: any;
            };
        };
        token: any;
    }>;
    getDashboard(employeeId: number): Promise<{
        workedHours: number;
        absences: any;
        schedule: {
            monday: {
                start: string;
                end: string;
            };
            tuesday: {
                start: string;
                end: string;
            };
            wednesday: {
                start: string;
                end: string;
            };
            thursday: {
                start: string;
                end: string;
            };
            friday: {
                start: string;
                end: string;
            };
            saturday: null;
            sunday: null;
        };
        currentMonth: number;
        currentYear: number;
    }>;
}
//# sourceMappingURL=EmployeeService.d.ts.map