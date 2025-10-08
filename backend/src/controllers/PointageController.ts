import { Request, Response } from 'express';
import { PointageService } from '../services/PointageService';
import { Users } from '@prisma/client';
import { TypePointage } from '../generated/tenant';
import { QRCodeGenerator } from '../utils/qrCodeGenerator';

const service = new PointageService();

export class PointageController {
  async create(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const { employeeId, type, heure } = req.body;

      if (!employeeId || !type) {
        return res.status(400).json({ message: 'employeeId et type sont requis' });
      }

      // Validate type
      const validTypes = ['ARRIVEE', 'DEPART', 'PAUSE_DEBUT', 'PAUSE_FIN'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Type de pointage invalide' });
      }

      const pointage = await service.create({
        employeeId: parseInt(employeeId),
        type: type as TypePointage,
        heure: heure ? new Date(heure) : new Date()
      }, user);

      res.status(201).json({ message: 'Pointage créé', data: pointage });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const id = parseInt(req.params.id || '');

      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide' });
      }

      const pointage = await service.findById(id, user);
      if (!pointage) {
        return res.status(404).json({ message: 'Pointage non trouvé' });
      }
      res.status(200).json({ message: 'Pointage récupéré', data: pointage });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const { employeeId, date, dateDebut, dateFin, type } = req.query;

      const filters: any = {};
      if (employeeId) filters.employeeId = parseInt(employeeId as string);
      if (date) filters.date = new Date(date as string);
      if (dateDebut) filters.dateDebut = new Date(dateDebut as string);
      if (dateFin) filters.dateFin = new Date(dateFin as string);
      if (type) filters.type = type as TypePointage;

      const pointages = await service.findAll(filters, user);
      res.status(200).json({ message: 'Pointages récupérés', data: pointages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getByEmployeeAndDate(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const employeeId = parseInt(req.params.employeeId || '');
      const date = new Date(req.params.date || '');

      if (isNaN(employeeId)) {
        return res.status(400).json({ message: 'ID d\'employé invalide' });
      }

      const pointages = await service.findByEmployeeAndDate(employeeId, date, user);
      res.status(200).json({ message: 'Pointages récupérés', data: pointages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getWorkedHours(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const employeeId = parseInt(req.params.employeeId || '');
      const month = parseInt(req.params.month || '');
      const year = parseInt(req.params.year || '');

      if (isNaN(employeeId) || isNaN(month) || isNaN(year)) {
        return res.status(400).json({ message: 'Paramètres invalides' });
      }

      const hours = await service.calculateWorkedHours(employeeId, month, year, user);
      res.status(200).json({ message: 'Heures travaillées calculées', data: { hours } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAttendanceSummary(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const employeeId = parseInt(req.params.employeeId || '');
      const month = parseInt(req.params.month || '');
      const year = parseInt(req.params.year || '');

      if (isNaN(employeeId) || isNaN(month) || isNaN(year)) {
        return res.status(400).json({ message: 'Paramètres invalides' });
      }

      const summary = await service.getEmployeeAttendanceSummary(employeeId, month, year, user);
      res.status(200).json({ message: 'Résumé de présence récupéré', data: summary });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const id = parseInt(req.params.id || '');
      const { type, heure } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide' });
      }

      const updateData: any = {};
      if (type) {
        const validTypes = ['ARRIVEE', 'DEPART', 'PAUSE_DEBUT', 'PAUSE_FIN'];
        if (!validTypes.includes(type)) {
          return res.status(400).json({ message: 'Type de pointage invalide' });
        }
        updateData.type = type as TypePointage;
      }
      if (heure) updateData.heure = new Date(heure);

      const pointage = await service.update(id, updateData, user);
      res.status(200).json({ message: 'Pointage mis à jour', data: pointage });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const id = parseInt(req.params.id || '');

      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide' });
      }

      await service.delete(id, user);
      res.status(200).json({ message: 'Pointage supprimé' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async createEmployeePointage(req: Request, res: Response) {
    try {
      const { employeeId, type } = req.body;

      if (!employeeId || !type) {
        return res.status(400).json({ message: 'employeeId et type requis' });
      }

      // Trouver l'employé via son ID dans la base de données unique
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const employee = await prisma.employee.findFirst({
        where: { id: parseInt(employeeId), actif: true },
        include: { entreprise: true }
      });

      if (!employee) {
        return res.status(404).json({ message: 'Employé non trouvé ou inactif' });
      }

      // Valider le type de pointage
      const validTypes = ['ARRIVEE', 'DEPART', 'PAUSE_DEBUT', 'PAUSE_FIN'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Type de pointage invalide' });
      }

      // Créer un faux utilisateur pour le service (puisque c'est public)
      const fakeUser = { entrepriseId: employee.entrepriseId } as any;

      const pointage = await service.create({
        employeeId: employee.id,
        type: type as TypePointage,
        heure: new Date()
      }, fakeUser);

      res.status(201).json({
        message: 'Pointage enregistré',
        data: {
          employee: employee.nom,
          type: type,
          heure: pointage.heure
        }
      });
    } catch (error: any) {
      console.error('Erreur pointage employé:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getLastPointageTimeForEmployees(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const lastPointages = await service.getLastPointageTimeForEmployees(user);
      res.status(200).json({ message: 'Derniers pointages récupérés', data: lastPointages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAttendance(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const entrepriseId = user.entrepriseId;
      if (!entrepriseId) {
        return res.status(400).json({ message: 'Entreprise non trouvée' });
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const { employeeId, date, dateDebut, dateFin } = req.query;

      const where: any = { employee: { entrepriseId } };
      if (employeeId) where.employeeId = parseInt(employeeId as string);
      if (date) where.date = new Date(date as string);
      if (dateDebut || dateFin) {
        where.date = {};
        if (dateDebut) where.date.gte = new Date(dateDebut as string);
        if (dateFin) where.date.lte = new Date(dateFin as string);
      }

      const attendance = await prisma.attendance.findMany({
        where,
        include: { employee: true },
        orderBy: { date: 'desc' }
      });

      res.status(200).json({ message: 'Présences récupérées', data: attendance });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async markAbsences(req: Request, res: Response) {
    try {
      const user = req.user as Users;
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({ message: 'Date requise' });
      }

      await service.markAbsencesForDate(new Date(date), user);
      res.status(200).json({ message: 'Absences marquées pour la date donnée' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
