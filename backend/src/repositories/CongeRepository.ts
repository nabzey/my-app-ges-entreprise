import { PrismaClient, CongeRequest, TypeConge, StatusConge } from '@prisma/client';

export class CongeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: {
    employeeId: number;
    typeConge: TypeConge;
    dateDebut: Date;
    dateFin: Date;
    motif?: string;
  }): Promise<CongeRequest> {
    return await this.prisma.congeRequest.create({
      data: {
        ...data,
        status: StatusConge.EN_ATTENTE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            nom: true,
            email: true,
            poste: true,
          }
        }
      }
    });
  }

  async findAll(filters?: {
    employeeId?: number;
    status?: StatusConge;
    typeConge?: TypeConge;
    entrepriseId?: number;
  }): Promise<CongeRequest[]> {
    const where: any = {};

    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;
    if (filters?.typeConge) where.typeConge = filters.typeConge;
    
    if (filters?.entrepriseId) {
      where.employee = {
        entrepriseId: filters.entrepriseId
      };
    }

    return await this.prisma.congeRequest.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        employee: {
          select: {
            id: true,
            nom: true,
            email: true,
            poste: true,
            entrepriseId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number): Promise<CongeRequest | null> {
    return await this.prisma.congeRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            nom: true,
            email: true,
            poste: true,
            entrepriseId: true,
          }
        }
      }
    });
  }

  async update(id: number, data: Partial<{
    status: StatusConge;
    commentaireRH: string | null;
  }>): Promise<CongeRequest> {
    return await this.prisma.congeRequest.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            nom: true,
            email: true,
            poste: true,
          }
        }
      }
    });
  }

  async getCongesByEmployee(
    employeeId: number,
    year?: number
  ): Promise<CongeRequest[]> {
    const where: any = { employeeId };

    if (year) {
      where.dateDebut = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      };
    }

    return await this.prisma.congeRequest.findMany({
      where,
      orderBy: { dateDebut: 'desc' }
    });
  }

  async countCongesByType(
    employeeId: number,
    typeConge: TypeConge,
    year: number
  ): Promise<number> {
    const conges = await this.prisma.congeRequest.findMany({
      where: {
        employeeId,
        typeConge,
        status: StatusConge.APPROUVE,
        dateDebut: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`)
        }
      }
    });

    let totalDays = 0;
    for (const conge of conges) {
      const days = Math.ceil(
        (conge.dateFin.getTime() - conge.dateDebut.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      totalDays += days;
    }

    return totalDays;
  }

  async checkConflict(
    employeeId: number,
    dateDebut: Date,
    dateFin: Date,
    excludeId?: number
  ): Promise<boolean> {
    const where: any = {
      employeeId,
      status: {
        in: [StatusConge.EN_ATTENTE, StatusConge.APPROUVE]
      },
      OR: [
        {
          dateDebut: { lte: dateFin },
          dateFin: { gte: dateDebut }
        }
      ]
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const conflicts = await this.prisma.congeRequest.findMany({ where });
    return conflicts.length > 0;
  }
}