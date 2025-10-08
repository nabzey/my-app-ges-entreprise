import { PrismaClient, Pointage, TypePointage } from '@prisma/client';

export class PointageRepository {
  public prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(
    pointageData: { employeeId: number; date: Date; type: TypePointage; heure: Date; entrepriseId: number }
  ): Promise<Pointage> {
    try {
      return await this.prisma.pointage.create({
        data: {
          ...pointageData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error('Erreur create Pointage:', error);
      throw new Error('Erreur lors de la création du pointage');
    }
  }

  async findAll(
    filters?: {
      employeeId?: number;
      date?: Date;
      dateDebut?: Date;
      dateFin?: Date;
      type?: TypePointage;
      entrepriseId?: number;
    }
  ): Promise<Pointage[]> {
    const where: any = {};

    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.entrepriseId) where.employee = { entrepriseId: filters.entrepriseId };
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.heure = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    if (filters?.dateDebut && filters?.dateFin) {
      where.heure = {
        gte: filters.dateDebut,
        lte: filters.dateFin,
      };
    }
    if (filters?.type) where.type = filters.type;

    try {
      return await this.prisma.pointage.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: { employee: true },
        orderBy: [
          { employeeId: 'asc' },
          { heure: 'asc' },
        ],
      });
    } catch (error: any) {
      console.error('Erreur findAll Pointages:', error);
      throw new Error('Erreur lors de la récupération des pointages');
    }
  }

  async getLastPointageTimeForEmployees(entrepriseId: number): Promise<{ employeeId: number; lastPointage: Date | null }[]> {
    try {
      const result = await this.prisma.$queryRaw<
        { employeeId: number; lastPointage: Date | null }[]
      >`
        SELECT employeeId, MAX(heure) as lastPointage
        FROM pointage
        INNER JOIN employee ON pointage.employeeId = employee.id
        WHERE employee.entrepriseId = ${entrepriseId}
        GROUP BY employeeId
      `;
      return result;
    } catch (error: any) {
      console.error('Erreur getLastPointageTimeForEmployees:', error);
      throw new Error('Erreur lors de la récupération des derniers pointages');
    }
  }

  async findById(id: number): Promise<Pointage | null> {
    try {
      return await this.prisma.pointage.findUnique({
        where: { id },
        include: { employee: true },
      });
    } catch (error: any) {
      console.error('Erreur findById Pointage:', error);
      throw new Error('Erreur lors de la récupération du pointage par ID');
    }
  }

  async findByEmployeeAndDate(
    employeeId: number,
    date: Date
  ): Promise<Pointage[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      return await this.prisma.pointage.findMany({
        where: {
          employeeId,
          heure: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { heure: 'asc' },
      });
    } catch (error: any) {
      console.error('Erreur findByEmployeeAndDate Pointage:', error);
      throw new Error('Erreur lors de la récupération des pointages par employé et date');
    }
  }

  async update(
    id: number,
    data: Partial<Omit<Pointage, 'id'>>
  ): Promise<Pointage> {
    try {
      return await this.prisma.pointage.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error('Erreur update Pointage:', error);
      throw new Error('Erreur lors de la mise à jour du pointage');
    }
  }

  async delete(id: number): Promise<Pointage> {
    try {
      return await this.prisma.pointage.delete({
        where: { id },
      });
    } catch (error: any) {
      console.error('Erreur delete Pointage:', error);
      throw new Error('Erreur lors de la suppression du pointage');
    }
  }

  async calculateWorkedHours(
    employeeId: number,
    month: number,
    year: number
  ): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    try {
      const pointages = await this.prisma.pointage.findMany({
        where: {
          employeeId,
          heure: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        orderBy: { heure: 'asc' },
      });

      let totalHours = 0;
      let arrivalTime: Date | null = null;

      for (const pointage of pointages) {
        if (pointage.type === 'ARRIVEE') {
          arrivalTime = pointage.heure;
        } else if (pointage.type === 'DEPART' && arrivalTime) {
          const workedMs = pointage.heure.getTime() - arrivalTime.getTime();
          totalHours += workedMs / (1000 * 60 * 60);
          arrivalTime = null;
        }
      }

      return Math.round(totalHours * 100) / 100;
    } catch (error: any) {
      console.error('Erreur calculateWorkedHours Pointage:', error);
      throw new Error('Erreur lors du calcul des heures travaillées');
    }
  }
}
