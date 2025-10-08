import { Users, Entreprises, Prisma } from "@prisma/client";
export declare class UsersRepository {
    private static prismaInstance;
    private prisma;
    constructor();
    findById(id: number): Promise<Users | null>;
    create(data: Prisma.UsersCreateInput): Promise<Users>;
    findByEmail(email: string): Promise<Users | null>;
    findAllUsers(): Promise<Users[]>;
    findUsersByEntrepriseId(entrepriseId: number): Promise<Users[]>;
    findUsersByRole(role: string): Promise<Users[]>;
    findUsersByEntrepriseIdAndRole(entrepriseId: number, role: "ADMIN" | "CAISSIER"): Promise<Users[]>;
    createEntreprise(data: Prisma.EntreprisesCreateInput): Promise<Entreprises>;
    findAllEntreprises(): Promise<Entreprises[]>;
    findEntrepriseById(id: number): Promise<Entreprises | null>;
    updateEntreprise(id: number, data: Partial<Prisma.EntreprisesUpdateInput>): Promise<Entreprises>;
    deleteEntreprise(id: number): Promise<void>;
    updateRole(id: number, role: string): Promise<Users>;
}
//# sourceMappingURL=UsersRepository.d.ts.map