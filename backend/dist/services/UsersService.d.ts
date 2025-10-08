import { Users, Entreprises } from "@prisma/client";
export declare class UsersService {
    private globalRepos;
    findUser(id: number, isSuperAdmin?: boolean): Promise<{
        id: number;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        entrepriseId: number | null;
    } | null | undefined>;
    create(user: Omit<Users, "id">, caller: {
        role: string;
        entrepriseId?: number | null;
        id: number;
    }): Promise<{
        id: number;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        entrepriseId: number | null;
    }>;
    loginUser(perso: {
        email: string;
        password: string;
    }): Promise<{
        user: any;
        accesToken: string;
        refreshToken: string;
    }>;
    createEntreprise(data: Omit<Entreprises, "id"> & {
        adminNom?: string;
        adminEmail?: string;
        adminPassword?: string;
        caissierNom?: string;
        caissierEmail?: string;
        caissierPassword?: string;
    }, userId: number): Promise<{
        id: number;
        nom: string;
        logo: string | null;
        adresse: string;
        paiement: string;
        dbName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllEntreprises(user: {
        role: string;
        entrepriseId?: number | null;
        id: number;
    }): Promise<{
        id: number;
        nom: string;
        logo: string | null;
        adresse: string;
        paiement: string;
        dbName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getUsersByEntreprise(caller: {
        role: string;
        entrepriseId?: number | null;
        id: number;
    }, entrepriseId?: number): Promise<{
        id: number;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        entrepriseId: number | null;
    }[]>;
    getAdminsAndCaissiers(entrepriseId: number, caller: {
        role: string;
        entrepriseId?: number | null;
    }): Promise<{
        admins: {
            id: number;
            nom: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            entrepriseId: number | null;
        }[];
        caissiers: {
            id: number;
            nom: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            entrepriseId: number | null;
        }[];
    }>;
    getEntreprisePersonnel(entrepriseId: number, caller: {
        role: string;
        entrepriseId?: number | null;
    }): Promise<{
        admins: {
            id: number;
            nom: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            entrepriseId: number | null;
        }[];
        caissiers: {
            id: number;
            nom: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            entrepriseId: number | null;
        }[];
        employees: any;
    }>;
    initEntrepriseData(entrepriseId: number, caller: {
        role: string;
        entrepriseId?: number | null;
        id: number;
    }): Promise<{
        initialized: boolean;
        message: string;
        counts: {
            employees: any;
            payRuns: any;
            payslips: any;
        };
    }>;
    getGlobalStats(user: {
        role: string;
        entrepriseId?: number | null;
        id: number;
    }): Promise<{
        totalEntreprises: number;
        entreprisesActives: number;
        totalEmployes: number;
        caTotal: number;
    }>;
    impersonateEntreprise(entrepriseId: number, caller: {
        role: string;
        id: number;
    }): Promise<{
        accesToken: string;
        entreprise: {
            id: number;
            nom: string;
            logo: string | null;
            adresse: string;
            paiement: string;
            dbName: string;
        };
    }>;
    changeUserRole(userId: number, newRole: string, caller: {
        role: string;
        id: number;
    }): Promise<{
        accesToken: string;
        user: {
            id: number;
            nom: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            entrepriseId: number | null;
        };
        entreprise: any;
    }>;
}
//# sourceMappingURL=UsersService.d.ts.map