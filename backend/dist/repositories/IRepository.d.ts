import { Entreprises } from "@prisma/client";
export interface IRepository<T> {
    findById(id: number): Promise<T | null>;
    create(data: Omit<T, "id">): Promise<T>;
    createEntreprise(data: Omit<Entreprises, "id">): Promise<Entreprises>;
    findAllEntreprises(): Promise<Entreprises[]>;
    findEntrepriseById(id: number): Promise<Entreprises | null>;
}
//# sourceMappingURL=IRepository.d.ts.map