"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const EmployeeService_1 = require("../services/EmployeeService");
const PointageService_1 = require("../services/PointageService");
const PayslipsService_1 = require("../services/PayslipsService");
const employeeService = new EmployeeService_1.EmployeeService();
const pointageService = new PointageService_1.PointageService();
const payslipService = new PayslipsService_1.PayslipsService();
class EmployeeController {
    // EMPLOYEE METHODS (accessible to logged-in employees)
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis" });
        }
        try {
            const result = await employeeService.login(email, password);
            res.status(200).json({
                message: 'Connexion réussie',
                data: result
            });
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
    async getDashboard(req, res) {
        try {
            const user = req.user;
            if (user.role !== 'EMPLOYEE') {
                return res.status(403).json({ message: 'Accès réservé aux employés' });
            }
            const dashboardData = await employeeService.getDashboard(user.id);
            res.status(200).json({
                message: "Données du tableau de bord récupérées",
                data: dashboardData
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getMyPointages(req, res) {
        try {
            const user = req.user;
            if (user.role !== 'EMPLOYEE') {
                return res.status(403).json({ message: 'Accès réservé aux employés' });
            }
            const employeeId = user.id;
            const pointages = await pointageService.findAll({ employeeId }, user);
            res.status(200).json({
                message: "Pointages récupérés",
                data: pointages
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getMyPayslips(req, res) {
        try {
            const user = req.user;
            if (user.role !== 'EMPLOYEE') {
                return res.status(403).json({ message: 'Accès réservé aux employés' });
            }
            const employeeId = user.id;
            const payslips = await payslipService.getPayslipsByEmployeeId(user, employeeId);
            res.status(200).json({
                message: "Bulletins de paie récupérés",
                data: payslips
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async downloadMyPayslipPdf(req, res) {
        try {
            const user = req.user;
            if (user.role !== 'EMPLOYEE') {
                return res.status(403).json({ message: 'Accès réservé aux employés' });
            }
            const payslipId = parseInt(req.params.id || '', 10);
            if (isNaN(payslipId)) {
                return res.status(400).json({ message: 'ID de bulletin invalide' });
            }
            const entrepriseId = user.entrepriseId;
            if (!entrepriseId) {
                return res.status(400).json({ message: 'Entreprise non sélectionnée' });
            }
            // Vérifier que le bulletin appartient à l'employé
            const hasAccess = await payslipService.checkPayslipOwnership(payslipId, user.employeeId, entrepriseId);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Accès non autorisé à ce bulletin' });
            }
            const pdfBuffer = await payslipService.generatePayslipPdf(payslipId, user);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=payslip_${payslipId}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // ADMIN METHODS (accessible to ADMIN, CAISSIER, SUPER_ADMIN)
    async create(req, res) {
        try {
            const user = req.user;
            const { nom, email, poste, password, typeContrat, tauxSalaire, coordonneesBancaires, actif, joursTravailles } = req.body;
            let entrepriseId;
            if (user.role === 'SUPER_ADMIN') {
                entrepriseId = req.body.entrepriseId;
                if (!entrepriseId) {
                    return res.status(400).json({ message: "Entreprise non spécifiée pour Super Admin" });
                }
            }
            else {
                entrepriseId = user.entrepriseId;
                if (!entrepriseId) {
                    return res.status(400).json({ message: "Entreprise non spécifiée" });
                }
            }
            const employee = await employeeService.create({
                nom,
                email,
                poste,
                password,
                typeContrat,
                tauxSalaire,
                coordonneesBancaires,
                actif,
                joursTravailles
            }, entrepriseId);
            res.status(201).json({
                message: "Employé créé avec succès",
                data: employee
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const user = req.user;
            let entrepriseId;
            // For SUPER_ADMIN, allow fetching employees from any enterprise via query param
            if (user.role === 'SUPER_ADMIN') {
                const queryEntrepriseId = req.query.entrepriseId;
                if (queryEntrepriseId) {
                    entrepriseId = Number(queryEntrepriseId);
                }
                else {
                    return res.status(400).json({ message: "Entreprise non spécifiée pour Super Admin" });
                }
            }
            else {
                // For ADMIN/CAISSIER, use their assigned entreprise
                entrepriseId = user.entrepriseId;
                if (!entrepriseId) {
                    return res.status(400).json({ message: "Entreprise non spécifiée" });
                }
            }
            const filters = req.query;
            const employees = await employeeService.findAll(filters, entrepriseId);
            res.status(200).json({
                message: "Employés récupérés",
                data: employees
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getById(req, res) {
        try {
            const user = req.user;
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID d\'employé manquant' });
            }
            const employeeId = parseInt(id, 10);
            if (isNaN(employeeId)) {
                return res.status(400).json({ message: 'ID d\'employé invalide' });
            }
            const employee = await employeeService.findById(employeeId);
            if (!employee) {
                return res.status(404).json({ message: "Employé non trouvé" });
            }
            // Check if user has access to this employee (same entreprise)
            if (user.role !== 'SUPER_ADMIN' && user.entrepriseId !== employee.entrepriseId) {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            res.status(200).json({
                message: "Employé trouvé",
                data: employee
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async update(req, res) {
        try {
            const user = req.user;
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID d\'employé manquant' });
            }
            const employeeId = parseInt(id, 10);
            if (isNaN(employeeId)) {
                return res.status(400).json({ message: 'ID d\'employé invalide' });
            }
            // Check if user has access to this employee
            const existingEmployee = await employeeService.findById(employeeId);
            if (!existingEmployee) {
                return res.status(404).json({ message: "Employé non trouvé" });
            }
            if (user.role !== 'SUPER_ADMIN' && user.entrepriseId !== existingEmployee.entrepriseId) {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            const updateData = req.body;
            const employee = await employeeService.update(employeeId, updateData);
            res.status(200).json({
                message: "Employé mis à jour",
                data: employee
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async delete(req, res) {
        try {
            const user = req.user;
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID d\'employé manquant' });
            }
            const employeeId = parseInt(id, 10);
            if (isNaN(employeeId)) {
                return res.status(400).json({ message: 'ID d\'employé invalide' });
            }
            // Check if user has access to this employee
            const existingEmployee = await employeeService.findById(employeeId);
            if (!existingEmployee) {
                return res.status(404).json({ message: "Employé non trouvé" });
            }
            if (user.role !== 'SUPER_ADMIN' && user.entrepriseId !== existingEmployee.entrepriseId) {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            const employee = await employeeService.delete(employeeId);
            res.status(200).json({
                message: "Employé supprimé",
                data: employee
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async toggleActif(req, res) {
        try {
            const user = req.user;
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID d\'employé manquant' });
            }
            const employeeId = parseInt(id, 10);
            if (isNaN(employeeId)) {
                return res.status(400).json({ message: 'ID d\'employé invalide' });
            }
            // Check if user has access to this employee
            const existingEmployee = await employeeService.findById(employeeId);
            if (!existingEmployee) {
                return res.status(404).json({ message: "Employé non trouvé" });
            }
            if (user.role !== 'SUPER_ADMIN' && user.entrepriseId !== existingEmployee.entrepriseId) {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            const employee = await employeeService.toggleActif(employeeId);
            res.status(200).json({
                message: "Statut modifié",
                data: employee
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async confirmCode(req, res) {
        try {
            const user = req.user;
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID d\'employé manquant' });
            }
            const employeeId = parseInt(id, 10);
            if (isNaN(employeeId)) {
                return res.status(400).json({ message: 'ID d\'employé invalide' });
            }
            // Check if user has access to this employee
            const existingEmployee = await employeeService.findById(employeeId);
            if (!existingEmployee) {
                return res.status(404).json({ message: "Employé non trouvé" });
            }
            if (user.role !== 'SUPER_ADMIN' && user.entrepriseId !== existingEmployee.entrepriseId) {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            const { code } = req.body;
            const employee = await employeeService.confirmCode(employeeId, code);
            res.status(200).json({
                message: "Code confirmé",
                data: employee
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async getQRCode(req, res) {
        try {
            const user = req.user;
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID d\'employé manquant' });
            }
            const employeeId = parseInt(id, 10);
            if (isNaN(employeeId)) {
                return res.status(400).json({ message: 'ID d\'employé invalide' });
            }
            // Check if user has access to this employee
            const existingEmployee = await employeeService.findById(employeeId);
            if (!existingEmployee) {
                return res.status(404).json({ message: "Employé non trouvé" });
            }
            if (user.role !== 'SUPER_ADMIN' && user.entrepriseId !== existingEmployee.entrepriseId) {
                return res.status(403).json({ message: 'Accès non autorisé' });
            }
            // Generate QR code
            const qrCodeText = `${existingEmployee.id}-${existingEmployee.nom}`;
            const QRCode = require('qrcode');
            const qrCodeDataURL = await QRCode.toDataURL(qrCodeText);
            res.status(200).json({
                message: "QR code généré",
                data: { qrCode: qrCodeDataURL }
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.EmployeeController = EmployeeController;
//# sourceMappingURL=EmployeeController.js.map