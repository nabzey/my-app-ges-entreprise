import { Users, Entreprises } from "@prisma/client";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import mysql from 'mysql2/promise';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

import { getTenantPrisma } from "../utils/tenantPrisma";
import { UsersRepository } from "../repositories/UsersRepository";

export class UsersService {
  private globalRepos = new UsersRepository();

  async findUser(id: number, isSuperAdmin = false) {
    if (isSuperAdmin) {
      return await this.globalRepos.findById(id);
    }
  }

  async create(user: Omit<Users, "id">, caller: { role: string; entrepriseId?: number | null; id: number }) {
    if (caller.role === "SUPER_ADMIN") {
      return await this.globalRepos.create({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      });
    }

    if (caller.role === "ADMIN") {
      if (user.role !== "CAISSIER") {
        throw new Error("Accès refusé : Un admin ne peut créer que des caissiers");
      }

      if (!caller.entrepriseId) {
        throw new Error("Erreur : Admin non associé à une entreprise");
      }

      if (user.entrepriseId !== caller.entrepriseId) {
        throw new Error("Accès refusé : Le caissier doit être lié à votre entreprise");
      }

      return await this.globalRepos.create({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      });
    }

    throw new Error("Accès refusé : Privilèges insuffisants pour créer un utilisateur");
  }

  async loginUser(perso: { email: string; password: string }) {
    console.log('[LOGIN] Attempting login for email:', perso.email);
    let user = await this.globalRepos.findByEmail(perso.email);

    if (!user) {
      console.log('[LOGIN] User not found for email:', perso.email);
      throw new Error("Utilisateur non trouvé");
    }

    // Force role update for superadmin email
    if (user.email === 'superadmin@example.com' && user.role !== 'SUPER_ADMIN') {
      console.log('[LOGIN] Forcing role update to SUPER_ADMIN for user:', user.email);
      user = await this.globalRepos.updateRole(user.id, 'SUPER_ADMIN');
    }

    console.log('[LOGIN] User found:', { id: user.id, email: user.email, role: user.role, entrepriseId: user.entrepriseId });

    const isPassValid = await bcrypt.compare(perso.password, user.password);
    if (!isPassValid) {
      console.log('[LOGIN] Invalid password for user:', user.email);
      throw new Error("Mot de passe incorrect");
    }

    console.log('[LOGIN] Password valid, generating tokens');

    const role = user.role;
    let dbName: string | null = null;
    let entreprisePayload: any = null;

    if (user.entrepriseId) {
      const entreprise = await this.globalRepos.findEntrepriseById(user.entrepriseId);
      dbName = entreprise?.dbName || null;
      if (entreprise) {
        entreprisePayload = {
          id: entreprise.id,
          nom: entreprise.nom,
          logo: entreprise.logo,
          adresse: entreprise.adresse,
          paiement: entreprise.paiement,
          dbName: entreprise.dbName,
        };
      }
    }

    const accesToken = Jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: role,
        entrepriseId: user.entrepriseId,
        dbName: dbName || null,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const refreshToken = Jwt.sign(
      {
        email: user.email,
        role: role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    const userPayload: any = { id: user.id, email: user.email, role: user.role, nom: user.nom };
    if (entreprisePayload) {
      userPayload.entreprise = entreprisePayload;
    }

    return { user: userPayload, accesToken, refreshToken };
  }

  async createEntreprise(data: Omit<Entreprises, "id"> & { adminNom?: string; adminEmail?: string; adminPassword?: string; caissierNom?: string; caissierEmail?: string; caissierPassword?: string }, userId: number) {
    const user = await this.globalRepos.findById(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    if (user.role !== "SUPER_ADMIN") {
      throw new Error("Accès refusé : Seul un Super Admin peut créer des entreprises");
    }

    // Créer l'entreprise sans dbName (single database)
    const entrepriseData = {
      nom: data.nom,
      logo: data.logo ?? null,
      adresse: data.adresse,
      paiement: data.paiement || "XOF",
      dbName: null, // Pas de base séparée
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    const entreprise = await this.globalRepos.createEntreprise(entrepriseData);

    // Création automatique de l'admin de l'entreprise si les données sont fournies
    if (data.adminNom && data.adminEmail && data.adminPassword) {
      const adminData = {
        email: data.adminEmail,
        password: data.adminPassword,
        role: "ADMIN" as const,
        nom: data.adminNom,
        entrepriseId: entreprise.id
      } as Omit<Users, "id">;

      await this.create(adminData, { role: "SUPER_ADMIN", entrepriseId: null, id: userId });
    }

    // Création automatique du caissier de l'entreprise si les données sont fournies
    if (data.caissierNom && data.caissierEmail && data.caissierPassword) {
      const caissierData = {
        email: data.caissierEmail,
        password: data.caissierPassword,
        role: "CAISSIER" as const,
        nom: data.caissierNom,
        entrepriseId: entreprise.id
      } as Omit<Users, "id">;

      await this.create(caissierData, { role: "SUPER_ADMIN", entrepriseId: null, id: userId });
    }

    // Initialiser les données par défaut (employés, etc.)
    try {
      await this.initEntrepriseData(entreprise.id, { role: 'SUPER_ADMIN', entrepriseId: null, id: userId });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données de l\'entreprise:', error);
      // Ne pas échouer la création
    }

    return entreprise; // Retour explicite pour le contrôleur
  }

  async getAllEntreprises(user: { role: string; entrepriseId?: number | null; id: number }) {
    if (user.role === "SUPER_ADMIN") {
      const entreprises = await this.globalRepos.findAllEntreprises();
      // Ajouter le nombre d'employés pour chaque entreprise
      const entreprisesWithEmployees = await Promise.all(
        entreprises.map(async (entreprise) => {
          let employeeCount = 0;
          try {
            // Utiliser PrismaClient directement pour compter les employés
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            employeeCount = await prisma.employee.count({
              where: { entrepriseId: entreprise.id }
            });
          } catch (error) {
            console.error(`Erreur récupération employés pour ${entreprise.nom}:`, error);
          }
          return {
            ...entreprise,
            _count: {
              ...(entreprise as any)._count,
              employees: employeeCount
            }
          };
        })
      );
      return entreprisesWithEmployees;
    }

    if (user.role === "ADMIN" && user.entrepriseId) {
      const entreprise = await this.globalRepos.findEntrepriseById(user.entrepriseId);
      if (entreprise) {
        try {
          // Utiliser PrismaClient directement pour compter les employés
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          const employeeCount = await prisma.employee.count({
            where: { entrepriseId: entreprise.id }
          });
          return [{
            ...entreprise,
            _count: {
              ...(entreprise as any)._count,
              employees: employeeCount
            }
          }];
        } catch (error) {
          console.error(`Erreur récupération employés pour ${entreprise.nom}:`, error);
          return [entreprise];
        }
      }
      return entreprise ? [entreprise] : [];
    }

    return [];
  }

  async getUsersByEntreprise(caller: { role: string; entrepriseId?: number | null; id: number }, entrepriseId?: number) {
    if (caller.role === "SUPER_ADMIN") {
      if (entrepriseId) {
        return await this.globalRepos.findUsersByEntrepriseId(entrepriseId);
      }
      return await this.globalRepos.findAllUsers();
    }

    if (caller.role === "ADMIN" && caller.entrepriseId) {
      return await this.globalRepos.findUsersByEntrepriseId(caller.entrepriseId);
    }

    throw new Error("Accès refusé");
  }

  async getAdminsAndCaissiers(entrepriseId: number, caller: { role: string; entrepriseId?: number | null }) {
    if (caller.role === "SUPER_ADMIN" || caller.entrepriseId === entrepriseId) {
      const admins = await this.globalRepos.findUsersByEntrepriseIdAndRole(entrepriseId, "ADMIN");
      const caissiers = await this.globalRepos.findUsersByEntrepriseIdAndRole(entrepriseId, "CAISSIER");
      return { admins, caissiers };
    }
    throw new Error("Accès refusé");
  }

  async getEntreprisePersonnel(entrepriseId: number, caller: { role: string; entrepriseId?: number | null }) {
    if (caller.role !== 'SUPER_ADMIN' && caller.entrepriseId !== entrepriseId) {
      throw new Error('Accès refusé');
    }
    const entreprise = await this.globalRepos.findEntrepriseById(entrepriseId);
    if (!entreprise) throw new Error('Entreprise introuvable');

    const admins = await this.globalRepos.findUsersByEntrepriseIdAndRole(entrepriseId, 'ADMIN');
    const caissiers = await this.globalRepos.findUsersByEntrepriseIdAndRole(entrepriseId, 'CAISSIER');

    // Utiliser PrismaClient directement pour récupérer les employés
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const employees = await prisma.employee.findMany({
      where: { entrepriseId }
    });

    return { admins, caissiers, employees };
  }

  async initEntrepriseData(
    entrepriseId: number,
    caller: { role: string; entrepriseId?: number | null; id: number }
  ) {
    if (caller.role === "SUPER_ADMIN") {
      // OK
    } else if (caller.role === "ADMIN" && caller.entrepriseId === entrepriseId) {
      // OK for own entreprise
    } else {
      throw new Error("Accès refusé");
    }

    const entreprise = await this.globalRepos.findEntrepriseById(entrepriseId);
    if (!entreprise) throw new Error("Entreprise non trouvée");

    // Utiliser PrismaClient directement
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const existingEmp = await prisma.employee.count({
      where: { entrepriseId }
    });
    if (existingEmp > 0) {
      const counts = {
        employees: existingEmp,
        payRuns: await prisma.payRun.count({ where: { entrepriseId } }),
        payslips: await prisma.payslip.count({
          where: {
            employee: { entrepriseId }
          }
        }),
        payments: await prisma.payment.count({
          where: {
            payslip: {
              employee: { entrepriseId }
            }
          }
        }),
      };
      return { initialized: false, message: "Données déjà présentes", counts };
    }

    await prisma.employee.createMany({
      data: [
        { nom: "Alpha Ndiaye", email: "alpha.ndiaye@example.com", poste: "Développeur", typeContrat: "FIXE", tauxSalaire: 250000, joursTravailles: null, coordonneesBancaires: null, actif: true, entrepriseId },
        { nom: "Awa Diop", email: "awa.diop@example.com", poste: "Comptable", typeContrat: "FIXE", tauxSalaire: 200000, joursTravailles: null, coordonneesBancaires: null, actif: true, entrepriseId },
        { nom: "Mamadou Sow", email: "mamadou.sow@example.com", poste: "Agent", typeContrat: "JOURNALIER", tauxSalaire: 10000, joursTravailles: 20, coordonneesBancaires: null, actif: true, entrepriseId },
      ]
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const payRun = await prisma.payRun.create({
      data: { periode: startOfMonth, type: "MENSUEL", entrepriseId }
    });

    const employees = await prisma.employee.findMany({
      where: { entrepriseId }
    });
    for (const emp of employees) {
      const brut = emp.tauxSalaire;
      const deductions = 0;
      await prisma.payslip.create({
        data: {
          employeeId: emp.id,
          payRunId: payRun.id,
          brut: brut,
          deductions: deductions,
          net: brut,
        }
      });
    }

    const result = {
      employees: await prisma.employee.count({ where: { entrepriseId } }),
      payRuns: await prisma.payRun.count({ where: { entrepriseId } }),
      payslips: await prisma.payslip.count({
        where: {
          employee: { entrepriseId }
        }
      }),
    };

    return { initialized: true, message: "Initialisation terminée", counts: result };
  }

  async getGlobalStats(user: { role: string; entrepriseId?: number | null; id: number }) {
    if (user.role !== "SUPER_ADMIN") {
      throw new Error("Accès refusé : Super Admin requis");
    }

    const entreprises = await this.globalRepos.findAllEntreprises();
    const totalEntreprises = entreprises.length;
    const entreprisesActives = entreprises.length; // Toutes sont actives pour l'instant

    let totalEmployes = 0;
    // Utiliser PrismaClient directement pour compter les employés
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    for (const entreprise of entreprises) {
      try {
        const count = await prisma.employee.count({
          where: { entrepriseId: entreprise.id }
        });
        totalEmployes += count;
      } catch (error) {
        console.error(`Erreur comptage employés pour ${entreprise.nom}:`, error);
      }
    }

    // Pour le CA total, on pourrait calculer basé sur les salaires, mais pour l'instant on met 0
    const caTotal = 0;

    return {
      totalEntreprises,
      entreprisesActives,
      totalEmployes,
      caTotal
    };
  }

  async impersonateEntreprise(entrepriseId: number, caller: { role: string; id: number }) {
    if (caller.role !== "SUPER_ADMIN") {
      throw new Error("Accès refusé : Super Admin requis");
    }

    const entreprise = await this.globalRepos.findEntrepriseById(entrepriseId);
    if (!entreprise || !entreprise.dbName) {
      throw new Error("Entreprise introuvable ou dbName manquant");
    }

    const currentUser = await this.globalRepos.findById(caller.id);

    const accesToken = Jwt.sign(
      {
        id: caller.id,
        email: currentUser?.email || "",
        role: "SUPER_ADMIN",
        entrepriseId: entreprise.id,
        dbName: entreprise.dbName,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const entreprisePayload = {
      id: entreprise.id,
      nom: entreprise.nom,
      logo: entreprise.logo,
      adresse: entreprise.adresse,
      paiement: entreprise.paiement,
      dbName: entreprise.dbName,
    };

    return { accesToken, entreprise: entreprisePayload };
  }

  async changeUserRole(userId: number, newRole: string, caller: { role: string; id: number }) {
    if (caller.role === "SUPER_ADMIN") {
      // SUPER_ADMIN can change any role
    } else if (caller.id === userId && caller.id === 1 && caller.role === "ADMIN" && newRole === "SUPER_ADMIN") {
      // Original super admin can change back to SUPER_ADMIN
    } else if (caller.id === userId && (caller.role === "ADMIN" || caller.role === "CAISSIER") && (newRole === "ADMIN" || newRole === "CAISSIER")) {
      // ADMIN and CAISSIER can change their own role between ADMIN and CAISSIER
    } else {
      throw new Error("Accès refusé");
    }

    const updatedUser = await this.globalRepos.updateRole(userId, newRole);

    const role = newRole;
    let dbName: string | null = null;
    let entreprisePayload: any = null;

    if (updatedUser.entrepriseId) {
      const entreprise = await this.globalRepos.findEntrepriseById(updatedUser.entrepriseId);
      dbName = entreprise?.dbName || null;
      if (entreprise) {
        entreprisePayload = {
          id: entreprise.id,
          nom: entreprise.nom,
          logo: entreprise.logo,
          adresse: entreprise.adresse,
          paiement: entreprise.paiement,
          dbName: entreprise.dbName,
        };
      }
    }

    const accesToken = Jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        role: role,
        entrepriseId: updatedUser.entrepriseId,
        dbName,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return { accesToken, user: updatedUser, entreprise: entreprisePayload };
  }
}
