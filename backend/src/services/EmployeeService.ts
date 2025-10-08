import { EmployeeRepository } from '../repositories/EmployeeRepository';
import { Employee, TypeContrat, Pointage } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { QRCodeGenerator } from '../utils/qrCodeGenerator';
import { EmailService } from '../utils/emailService';
import bcrypt from 'bcrypt';

export class EmployeeService {
  private repo = new EmployeeRepository();
  private emailService = new EmailService();

  async create(employeeData: { nom: string; email: string; poste: string; password?: string | undefined; typeContrat: TypeContrat; tauxSalaire: number; coordonneesBancaires?: string | null; actif?: boolean; joursTravailles?: number | null }, entrepriseId: number): Promise<Employee> {
    // Validation métier
    if (employeeData.tauxSalaire <= 0) {
      throw new Error('Le taux salaire doit être positif');
    }

    if (employeeData.typeContrat === TypeContrat.JOURNALIER && (!employeeData.joursTravailles || employeeData.joursTravailles <= 0)) {
      throw new Error('Le nombre de jours travaillés est requis pour les contrats journaliers');
    }

    // Vérifier si l'email existe déjà
    const existingEmployee = await this.repo.findByEmail(employeeData.email);
    if (existingEmployee) {
      throw new Error('Un employé avec cet email existe déjà');
    }

    // Générer un mot de passe si non fourni
    const generatedPassword = employeeData.password || Math.random().toString(36).substring(2, 10);

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Générer le QR code immédiatement
    const qrCode = QRCodeGenerator.generateQRCodeText(0, employeeData.nom); // ID sera mis à jour après création

    const data = {
      nom: employeeData.nom,
      email: employeeData.email,
      password: hashedPassword,
      poste: employeeData.poste,
      typeContrat: employeeData.typeContrat,
      tauxSalaire: employeeData.tauxSalaire,
      coordonneesBancaires: employeeData.coordonneesBancaires || null,
      actif: employeeData.actif ?? true,
      joursTravailles: employeeData.joursTravailles || null,
      qrCode,
      confirmationCode: null, // Plus de confirmation nécessaire
      entrepriseId
    };

    const employee = await this.repo.create(data);

    // Mettre à jour le QR code avec l'ID réel
    const updatedQrCode = QRCodeGenerator.generateQRCodeText(employee.id, employeeData.nom);
    await this.repo.update(employee.id, { qrCode: updatedQrCode });

    // Envoyer l'email avec le QR code et les identifiants
    await this.emailService.sendWelcomeEmail(employeeData.email, generatedPassword, updatedQrCode, employeeData.nom);

    return { ...employee, qrCode: updatedQrCode };
  }

  async findAll(
    filters: {
      status?: boolean;
      poste?: string;
      typeContrat?: TypeContrat;
      actif?: boolean;
    },
    entrepriseId: number
  ): Promise<Employee[]> {
    return await this.repo.findAll({ ...filters, entrepriseId });
  }

  async findById(id: number): Promise<Employee | null> {
    return await this.repo.findById(id);
  }

  async update(id: number, data: Partial<{ nom: string; poste: string; typeContrat: TypeContrat; tauxSalaire: number; coordonneesBancaires: string | null; actif: boolean; joursTravailles: number | null }>): Promise<Employee> {
    // Validation métier
    if (data.tauxSalaire !== undefined && data.tauxSalaire <= 0) {
      throw new Error('Le taux salaire doit être positif');
    }

    // Vérifier l'employé existant pour valider les changements
    const existingEmployee = await this.repo.findById(id);
    if (!existingEmployee) {
      throw new Error('Employé non trouvé');
    }

    // Validation pour les contrats journaliers
    const finalTypeContrat = data.typeContrat || existingEmployee.typeContrat;
    const finalJoursTravailles = data.joursTravailles !== undefined ? data.joursTravailles : existingEmployee.joursTravailles;

    if (finalTypeContrat === TypeContrat.JOURNALIER && (!finalJoursTravailles || finalJoursTravailles <= 0)) {
      throw new Error('Le nombre de jours travaillés est requis pour les contrats journaliers');
    }

    const updateData: any = { ...data };
    if (data.tauxSalaire !== undefined) {
      updateData.tauxSalaire = new Prisma.Decimal(data.tauxSalaire);
    }

    return await this.repo.update(id, updateData);
  }

  async delete(id: number): Promise<Employee> {
    return await this.repo.delete(id);
  }

  async toggleActif(id: number): Promise<Employee> {
    const employee = await this.repo.findById(id);
    if (!employee) {
      throw new Error('Employé non trouvé');
    }
    return await this.repo.update(id, { actif: !employee.actif });
  }

  async confirmCode(employeeId: number, code: string): Promise<Employee | null> {
    // Since QR code is sent directly on creation, this method is kept for compatibility
    // but QR code is already generated and sent
    const employee = await this.repo.findById(employeeId);
    if (!employee) {
      throw new Error('Employé non trouvé');
    }
    return employee;
  }

  async login(email: string, password: string) {
    const employee = await this.repo.findByEmail(email);
    if (!employee) {
      throw new Error("Employé non trouvé");
    }

    if (!employee.password) {
      throw new Error("Mot de passe non défini");
    }

    const isPassValid = await bcrypt.compare(password, employee.password);
    if (!isPassValid) {
      throw new Error("Mot de passe incorrect");
    }

    if (!employee.actif) {
      throw new Error("Compte désactivé");
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        id: employee.id,
        email: employee.email,
        role: 'EMPLOYEE',
        entrepriseId: employee.entrepriseId,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const userPayload = {
      id: employee.id,
      email: employee.email,
      nom: employee.nom,
      poste: employee.poste,
      role: 'EMPLOYEE',
      qrCode: employee.qrCode,
      entreprise: {
        id: (employee as any).entreprise.id,
        nom: (employee as any).entreprise.nom,
        adresse: (employee as any).entreprise.adresse,
      }
    };

    return { user: userPayload, token };
  }

  async getDashboard(employeeId: number) {
    const employee = await this.repo.findById(employeeId);
    if (!employee) {
      throw new Error('Employé non trouvé');
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Calculate worked hours for current month
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const pointages = await prisma.pointage.findMany({
      where: {
        employeeId,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
      }
    });

    let workedHours = 0;
    pointages.forEach((pointage: Pointage) => {
      if (pointage.type === 'DEPART' && pointage.heure) {
        // Simple calculation: assume 8 hours per day if departure exists
        workedHours += 8;
      }
    });

    // Get absences (marked as ABSENT in attendance)
    const absences = await prisma.attendance.findMany({
      where: {
        employeeId,
        status: 'ABSENT',
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
      }
    });

    // Simple schedule (placeholder)
    const schedule = {
      monday: { start: '08:00', end: '17:00' },
      tuesday: { start: '08:00', end: '17:00' },
      wednesday: { start: '08:00', end: '17:00' },
      thursday: { start: '08:00', end: '17:00' },
      friday: { start: '08:00', end: '17:00' },
      saturday: null,
      sunday: null
    };

    return {
      workedHours,
      absences,
      schedule,
      currentMonth,
      currentYear
    };
  }
}
