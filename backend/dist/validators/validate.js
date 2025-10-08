"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.congeRejectSchema = exports.congeApproveSchema = exports.congeRequestCreateSchema = exports.payslipUpdateSchema = exports.payRunUpdateSchema = exports.payRunCreateSchema = exports.paymentUpdateSchema = exports.paymentCreateSchema = exports.employeeUpdateSchema = exports.employeeCreateSchema = exports.userUpdateSchema = exports.entrepriseUpdateSchema = exports.entrepriseCreateSchema = exports.employeeLoginSchema = exports.userLoginSchema = exports.userCreateSchema = void 0;
const zod_1 = require("zod");
const RoleEnum = zod_1.z.enum(["SUPER_ADMIN", "ADMIN", "CAISSIER", "EMPLOYEE"]);
const TypeContratEnum = zod_1.z.enum(["JOURNALIER", "FIXE", "HONORAIRE"]);
const ModePaiementEnum = zod_1.z.enum(["ESPECES", "VIREMENT_BANCAIRE", "ORANGE_MONEY", "WAVE"]);
const StatusPaiementEnum = zod_1.z.enum(["PARTIEL", "TOTAL"]);
const StatusPayRunEnum = zod_1.z.enum(["BROUILLON", "APPROUVE", "CLOTURE"]);
const StatusPayslipEnum = zod_1.z.enum(["PAYE", "PARTIEL", "EN_ATTENTE"]);
const TypeCongeEnum = zod_1.z.enum(["ANNUEL", "MALADIE", "SANS_SOLDE", "MATERNITE", "PATERNITE", "EXCEPTIONNEL"]);
exports.userCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Email invalide" }),
    password: zod_1.z.string().min(8, { message: "Mot de passe trop court (min 8 caractères)" }),
    role: RoleEnum,
    nom: zod_1.z.string().min(1, { message: "Le nom est requis" }),
    entrepriseId: zod_1.z.number().optional().nullable(),
}).refine((data) => {
    // Un SUPER_ADMIN n'a pas besoin d'entrepriseId
    if (data.role === "SUPER_ADMIN") {
        return data.entrepriseId === null || data.entrepriseId === undefined;
    }
    // Un ADMIN ou CAISSIER doit avoir un entrepriseId
    if (data.role === "ADMIN" || data.role === "CAISSIER") {
        return data.entrepriseId !== null && data.entrepriseId !== undefined;
    }
    return true;
}, {
    message: "Les ADMIN et CAISSIER doivent être associés à une entreprise, pas les SUPER_ADMIN",
    path: ["entrepriseId"],
});
exports.userLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.employeeLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.entrepriseCreateSchema = zod_1.z.object({
    nom: zod_1.z.string().min(1, { message: "Le nom de l'entreprise est requis" }),
    logo: zod_1.z.string().optional(),
    adresse: zod_1.z.string().min(1, { message: "L'adresse est requise" }),
    paiement: zod_1.z.string().default("XOF"),
    // Données pour créer l'admin automatiquement
    adminNom: zod_1.z.string().min(1, { message: "Le nom de l'admin est requis" }).optional(),
    adminEmail: zod_1.z.string().email({ message: "Email admin invalide" }).optional(),
    adminPassword: zod_1.z.string().min(8, { message: "Mot de passe admin trop court (min 8 caractères)" }).optional(),
    // Données pour créer le caissier automatiquement
    caissierNom: zod_1.z.string().min(1, { message: "Le nom du caissier est requis" }).optional(),
    caissierEmail: zod_1.z.string().email({ message: "Email caissier invalide" }).optional(),
    caissierPassword: zod_1.z.string().min(8, { message: "Mot de passe caissier trop court (min 8 caractères)" }).optional(),
}).refine((data) => {
    // Soit tous les champs admin sont fournis, soit aucun
    const hasAdminFields = Boolean(data.adminNom && data.adminEmail && data.adminPassword);
    const hasNoneAdmin = !data.adminNom && !data.adminEmail && !data.adminPassword;
    return hasAdminFields || hasNoneAdmin;
}, {
    message: "Tous les champs admin (nom, email, password) doivent être fournis ensemble ou aucun",
    path: ["adminNom"],
}).refine((data) => {
    // Soit tous les champs caissier sont fournis, soit aucun
    const hasCaissierFields = Boolean(data.caissierNom && data.caissierEmail && data.caissierPassword);
    const hasNoneCaissier = !data.caissierNom && !data.caissierEmail && !data.caissierPassword;
    return hasCaissierFields || hasNoneCaissier;
}, {
    message: "Tous les champs caissier (nom, email, password) doivent être fournis ensemble ou aucun",
    path: ["caissierNom"],
});
// Schéma pour la mise à jour d'une entreprise
exports.entrepriseUpdateSchema = zod_1.z.object({
    nom: zod_1.z.string().min(1).optional(),
    logo: zod_1.z.string().optional(),
    adresse: zod_1.z.string().min(1).optional(),
    paiement: zod_1.z.string().optional(),
});
// Schéma pour la mise à jour d'un utilisateur
exports.userUpdateSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(8).optional(),
    nom: zod_1.z.string().min(1).optional(),
    role: RoleEnum.optional(),
    entrepriseId: zod_1.z.number().optional().nullable(),
});
// Schéma pour créer un employé
exports.employeeCreateSchema = zod_1.z.object({
    nom: zod_1.z.string().min(1, { message: "Le nom est requis" }),
    email: zod_1.z.string().email({ message: "Email invalide" }),
    password: zod_1.z.string().min(8, { message: "Mot de passe trop court (min 8 caractères)" }).optional(),
    poste: zod_1.z.string().min(1, { message: "Le poste est requis" }),
    typeContrat: TypeContratEnum,
    tauxSalaire: zod_1.z.number().positive({ message: "Le taux salaire doit être positif" }),
    joursTravailles: zod_1.z.number().int().positive().optional(),
    coordonneesBancaires: zod_1.z.string().optional(),
    actif: zod_1.z.boolean().optional(),
    entrepriseId: zod_1.z.number().optional(),
}).refine((data) => {
    if (data.typeContrat === "JOURNALIER") {
        return typeof data.joursTravailles === 'number' && data.joursTravailles > 0;
    }
    return true;
}, {
    message: "Le nombre de jours travaillés est requis et doit être > 0 pour les contrats journaliers",
    path: ["joursTravailles"],
});
// Schéma pour mettre à jour un employé
exports.employeeUpdateSchema = zod_1.z.object({
    nom: zod_1.z.string().min(1).optional(),
    poste: zod_1.z.string().min(1).optional(),
    typeContrat: TypeContratEnum.optional(),
    tauxSalaire: zod_1.z.number().positive().optional(),
    joursTravailles: zod_1.z.number().int().positive().optional(),
    coordonneesBancaires: zod_1.z.string().optional(),
    actif: zod_1.z.boolean().optional(),
});
// Schéma pour créer un paiement
exports.paymentCreateSchema = zod_1.z.object({
    montant: zod_1.z.number().positive({ message: "Le montant doit être positif" }),
    mode: ModePaiementEnum,
    date: zod_1.z.string().datetime().optional(),
    payslipId: zod_1.z.number().int().positive({ message: "ID bulletin invalide" }),
});
// Schéma pour mettre à jour un paiement
exports.paymentUpdateSchema = zod_1.z.object({
    montant: zod_1.z.number().positive().optional(),
    mode: ModePaiementEnum.optional(),
    date: zod_1.z.string().datetime().optional(),
    payslipId: zod_1.z.number().int().positive().optional(),
});
// Schéma pour créer un cycle de paie
exports.payRunCreateSchema = zod_1.z.object({
    periode: zod_1.z.string().datetime({ message: "Période invalide" }),
    type: zod_1.z.string().min(1, { message: "Type requis" }),
    status: StatusPayRunEnum.optional(),
});
// Schéma pour mettre à jour un cycle de paie
exports.payRunUpdateSchema = zod_1.z.object({
    periode: zod_1.z.string().datetime().optional(),
    type: zod_1.z.string().min(1).optional(),
    status: StatusPayRunEnum.optional(),
});
// Schéma pour mettre à jour un bulletin de paie
exports.payslipUpdateSchema = zod_1.z.object({
    brut: zod_1.z.number().positive().optional(),
    deductions: zod_1.z.number().min(0).optional(),
    net: zod_1.z.number().positive().optional(),
    status: StatusPayslipEnum.optional(),
});
exports.congeRequestCreateSchema = zod_1.z.object({
    typeConge: TypeCongeEnum,
    dateDebut: zod_1.z.string()
        .refine(val => !isNaN(Date.parse(val)), {
        message: 'Format de date invalide pour dateDebut'
    })
        .transform(str => new Date(str)),
    dateFin: zod_1.z.string()
        .refine(val => !isNaN(Date.parse(val)), {
        message: 'Format de date invalide pour dateFin'
    })
        .transform(str => new Date(str)),
    motif: zod_1.z.string().optional()
}).refine(data => data.dateFin >= data.dateDebut, {
    message: 'La date de fin doit être après la date de début',
    path: ['dateFin']
});
exports.congeApproveSchema = zod_1.z.object({
    commentaireRH: zod_1.z.string().optional()
});
exports.congeRejectSchema = zod_1.z.object({
    commentaireRH: zod_1.z.string().min(1, 'Un commentaire est requis pour rejeter une demande')
});
//# sourceMappingURL=validate.js.map