import { CongeRepository } from '../repositories/CongeRepository';
import { CongeRequest, TypeConge, StatusConge } from '@prisma/client';
import { EmailService } from '../utils/emailService';

export class CongeService {
  private repo = new CongeRepository();
  private emailService = new EmailService();

  private readonly CONGE_ANNUEL_LIMIT = 30; 
  private readonly CONGE_MALADIE_LIMIT = 15; 

  async createCongeRequest(data: {
    employeeId: number;
    typeConge: TypeConge;
    dateDebut: Date;
    dateFin: Date;
    motif?: string;
  }): Promise<CongeRequest> {
    const debut = new Date(data.dateDebut);
    const fin = new Date(data.dateFin);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (debut < today) {
      throw new Error('La date de début ne peut pas être dans le passé');
    }

    if (fin < debut) {
      throw new Error('La date de fin doit être après la date de début');
    }

    const hasConflict = await this.repo.checkConflict(
      data.employeeId,
      debut,
      fin
    );

    if (hasConflict) {
      throw new Error('Vous avez déjà une demande de congé sur cette période');
    }

    const nombreJours = this.calculateWorkDays(debut, fin);

    if (nombreJours < 1) {
      throw new Error('La durée du congé doit être d\'au moins 1 jour');
    }

    const currentYear = debut.getFullYear();
    if (data.typeConge === TypeConge.ANNUEL) {
      const congesUtilises = await this.repo.countCongesByType(
        data.employeeId,
        TypeConge.ANNUEL,
        currentYear
      );

      if (congesUtilises + nombreJours > this.CONGE_ANNUEL_LIMIT) {
        throw new Error(
          `Vous ne pouvez pas prendre plus de ${this.CONGE_ANNUEL_LIMIT} jours de congés annuels. Vous avez déjà utilisé ${congesUtilises} jours.`
        );
      }
    }

    const congeRequest = await this.repo.create(data);

    return congeRequest;
  }

  async getAllCongeRequests(filters?: {
    employeeId?: number;
    status?: StatusConge;
    typeConge?: TypeConge;
    entrepriseId?: number;
  }): Promise<CongeRequest[]> {
    return await this.repo.findAll(filters);
  }

  async getCongeRequestById(id: number): Promise<CongeRequest | null> {
    return await this.repo.findById(id);
  }

  async approveCongeRequest(
    id: number,
    commentaireRH?: string
  ): Promise<CongeRequest> {
    const congeRequest = await this.repo.findById(id);
    if (!congeRequest) {
      throw new Error('Demande de congé non trouvée');
    }

    if (congeRequest.status !== StatusConge.EN_ATTENTE) {
      throw new Error('Cette demande a déjà été traitée');
    }

    const updated = await this.repo.update(id, {
      status: StatusConge.APPROUVE,
      ...(commentaireRH !== undefined && { commentaireRH })
    });

    // Envoyer un email de confirmation à l'employé
    // await this.emailService.sendCongeApprovalEmail(updated);

    return updated;
  }

  async rejectCongeRequest(
    id: number,
    commentaireRH: string
  ): Promise<CongeRequest> {
    const congeRequest = await this.repo.findById(id);
    if (!congeRequest) {
      throw new Error('Demande de congé non trouvée');
    }

    if (congeRequest.status !== StatusConge.EN_ATTENTE) {
      throw new Error('Cette demande a déjà été traitée');
    }

    if (!commentaireRH) {
      throw new Error('Un commentaire est requis pour rejeter une demande');
    }

    const updated = await this.repo.update(id, {
      status: StatusConge.REJETE,
      commentaireRH
    });

    // Envoyer un email de rejet à l'employé
    // await this.emailService.sendCongeRejectionEmail(updated);

    return updated;
  }

  async cancelCongeRequest(
    id: number,
    employeeId: number
  ): Promise<CongeRequest> {
    const congeRequest = await this.repo.findById(id);
    if (!congeRequest) {
      throw new Error('Demande de congé non trouvée');
    }

    if (congeRequest.employeeId !== employeeId) {
      throw new Error('Vous ne pouvez pas annuler cette demande');
    }

    if (congeRequest.status === StatusConge.APPROUVE) {
      // Vérifier si le congé n'a pas déjà commencé
      const today = new Date();
      if (congeRequest.dateDebut <= today) {
        throw new Error('Impossible d\'annuler un congé déjà commencé');
      }
    }

    if (congeRequest.status === StatusConge.ANNULE || congeRequest.status === StatusConge.REJETE) {
      throw new Error('Cette demande a déjà été annulée ou rejetée');
    }

    return await this.repo.update(id, {
      status: StatusConge.ANNULE
    });
  }

  async getCongeBalance(employeeId: number): Promise<{
    congesAnnuels: { utilises: number; restants: number; total: number };
    congesMaladie: { utilises: number; restants: number; total: number };
    congesEnAttente: number;
  }> {
    const currentYear = new Date().getFullYear();

    const congesAnnuelsUtilises = await this.repo.countCongesByType(
      employeeId,
      TypeConge.ANNUEL,
      currentYear
    );

    const congesMaladieUtilises = await this.repo.countCongesByType(
      employeeId,
      TypeConge.MALADIE,
      currentYear
    );

    const congesEnAttente = await this.repo.findAll({
      employeeId,
      status: StatusConge.EN_ATTENTE
    });

    return {
      congesAnnuels: {
        utilises: congesAnnuelsUtilises,
        restants: this.CONGE_ANNUEL_LIMIT - congesAnnuelsUtilises,
        total: this.CONGE_ANNUEL_LIMIT
      },
      congesMaladie: {
        utilises: congesMaladieUtilises,
        restants: this.CONGE_MALADIE_LIMIT - congesMaladieUtilises,
        total: this.CONGE_MALADIE_LIMIT
      },
      congesEnAttente: congesEnAttente.length
    };
  }

  private calculateWorkDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // Exclure samedi (6) et dimanche (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
}