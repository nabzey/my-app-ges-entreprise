"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const UsersService_1 = require("../services/UsersService");
const validate_1 = require("../validators/validate");
const service = new UsersService_1.UsersService();
class UsersController {
    async createUser(req, res) {
        const users = validate_1.userCreateSchema.safeParse(req.body);
        if (!users.success)
            return res.status(400).json({ message: "error", error: users.error.format() });
        try {
            const caller = req.user;
            const newUser = await service.create(req.body, caller);
            res.status(200).json({
                message: "Utilisateur créé avec succès",
                data: newUser
            });
        }
        catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
    async createEntreprise(req, res) {
        const entreprise = validate_1.entrepriseCreateSchema.safeParse(req.body);
        if (!entreprise.success)
            return res.status(400).json({ message: "Validation error", details: entreprise.error.format() });
        try {
            if (req.user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ message: "Seul un Super Admin peut créer des entreprises" });
            }
            const entrepriseCreated = await service.createEntreprise(req.body, req.user.id);
            res.status(200).json({
                message: "Entreprise créée avec succès",
                data: entrepriseCreated
            });
        }
        catch (error) {
            console.error("Create entreprise error:", error);
            res.status(500).json({ message: "Server error", details: error.message });
        }
    }
    async getEntreprises(req, res) {
        try {
            const entreprises = await service.getAllEntreprises(req.user);
            res.status(200).json({
                message: "Entreprises récupérées",
                data: entreprises
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async login(req, res) {
        const verif = validate_1.userLoginSchema.safeParse(req.body);
        if (!verif.success)
            return res.status(401).json({ message: "invalide", error: verif.error.format() });
        try {
            const loginResult = await service.loginUser(req.body);
            res.status(200).json({
                message: 'Connexion réussie',
                data: loginResult
            });
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
    async getAdminsAndCaissiers(req, res) {
        const entrepriseId = Number(req.params.id);
        if (!entrepriseId)
            return res.status(400).json({ message: "Id d'entreprise invalide" });
        try {
            const result = await service.getAdminsAndCaissiers(entrepriseId, req.user);
            res.status(200).json({ message: "Utilisateurs récupérés", data: result });
        }
        catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
    async getUsersByEntreprise(req, res) {
        try {
            const entrepriseId = req.params.entrepriseId ? parseInt(req.params.entrepriseId) : undefined;
            const users = await service.getUsersByEntreprise(req.user, entrepriseId);
            res.status(200).json({
                message: "Utilisateurs récupérés",
                data: users
            });
        }
        catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
    async initEntrepriseData(req, res) {
        const id = Number(req.params.id);
        if (!id)
            return res.status(400).json({ message: "Id d'entreprise invalide" });
        try {
            const result = await service.initEntrepriseData(id, req.user);
            res.status(200).json({ message: "Initialisation effectuée", data: result });
        }
        catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
    async impersonateEntreprise(req, res) {
        const id = Number(req.params.id);
        if (!id)
            return res.status(400).json({ message: "Id d'entreprise invalide" });
        try {
            const result = await service.impersonateEntreprise(id, { role: req.user.role, id: req.user.id });
            res.status(200).json({ message: "Contexte entreprise établi", data: result });
        }
        catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
    async getEntreprisePersonnel(req, res) {
        const id = Number(req.params.id);
        if (!id)
            return res.status(400).json({ message: "Id d'entreprise invalide" });
        try {
            const result = await service.getEntreprisePersonnel(id, req.user);
            res.status(200).json({ message: "Personnel récupéré", data: result });
        }
        catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
    async getGlobalStats(req, res) {
        try {
            const stats = await service.getGlobalStats(req.user);
            res.status(200).json({ message: "Statistiques récupérées", data: stats });
        }
        catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
    async changeUserRole(req, res) {
        const { userId, newRole } = req.body;
        if (!userId || !newRole)
            return res.status(400).json({ message: "userId et newRole requis" });
        try {
            const result = await service.changeUserRole(userId, newRole, req.user);
            res.status(200).json({ message: "Rôle changé avec succès", data: result });
        }
        catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
}
exports.UsersController = UsersController;
//# sourceMappingURL=UsersController.js.map