import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EntreprisesController {
  static async listEntreprises(req: Request, res: Response) {
    try {
      const entreprises = await prisma.entreprises.findMany({
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      });
      res.json({ data: entreprises });
    } catch (error) {
      console.error('Erreur récupération entreprises:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async getEntrepriseStats(req: Request, res: Response) {
    if (!req.params.id) {
      return res.status(400).json({ error: 'ID entreprise manquant' });
    }
    const entrepriseId = parseInt(req.params.id, 10);
    if (isNaN(entrepriseId)) {
      return res.status(400).json({ error: 'ID entreprise invalide' });
    }

    try {
      // Count users and employees for the entreprise
      const usersCount = await prisma.users.count({
        where: { entrepriseId },
      });

      // Assuming you have an employees model linked to entreprise
      // The tenant schema has Employee model, but global prisma does not
      // So we cannot query employee or payslip from global prisma directly
      // We will return only usersCount here for now

      res.json({
        usersCount,
      });
    } catch (error) {
      console.error('Erreur récupération stats entreprise:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}
