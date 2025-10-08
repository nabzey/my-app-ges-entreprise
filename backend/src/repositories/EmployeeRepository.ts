import { PrismaClient, Employee, TypeContrat } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class EmployeeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(employeeData: {
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
  }): Promise<Employee> {
    // Stocker l'email en minuscule pour uniformité
    const emailLower = employeeData.email.toLowerCase();

    return await this.prisma.employee.create({
      data: {
        ...employeeData,
        email: emailLower,
        tauxSalaire: new Prisma.Decimal(employeeData.tauxSalaire),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findAll(filters?: {
    poste?: string;
    typeContrat?: TypeContrat;
    actif?: boolean;
    entrepriseId?: number;
  }): Promise<Employee[]> {
    const where: any = {};

    if (filters?.poste)
      where.poste = { contains: filters.poste, mode: 'insensitive' }; // OK ici
    if (filters?.typeContrat) where.typeContrat = filters.typeContrat;
    if (filters?.actif !== undefined) where.actif = filters.actif;
    if (filters?.entrepriseId) where.entrepriseId = filters.entrepriseId;

    return await this.prisma.employee.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
    });
  }

  async findById(id: number): Promise<Employee | null> {
    return await this.prisma.employee.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    data: Partial<Omit<Employee, 'id'>>,
  ): Promise<Employee> {
    // Si email dans data, forcer en minuscule aussi
    if (data.email) {
      data.email = data.email.toLowerCase();
    }

    return await this.prisma.employee.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: number): Promise<Employee> {
    return await this.prisma.employee.delete({
      where: { id },
    });
  }

  // Recherche insensible à la casse, sans 'mode' qui pose problème
  async findByEmail(email: string): Promise<Employee | null> {
    const emailLower = email.toLowerCase();

    // Recherche stricte par égalité, en forçant la casse minuscule côté base
    return await this.prisma.employee.findUnique({
      where: { email: emailLower },
      include: {
        entreprise: true,
      },
    });
  }
}
