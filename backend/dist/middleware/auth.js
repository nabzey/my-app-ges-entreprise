"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSameEntreprise = exports.requireAdminOrCaissierRestricted = exports.requireAdminOrCaissier = exports.requireAdminOrSuperAdmin = exports.requireAdminOrSuperAdminRestricted = exports.requireSuperAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const globalPrisma = new client_1.PrismaClient();
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = decoded;
        // Add dbName if entrepriseId exists
        if (req.user && req.user.entrepriseId) {
            try {
                const entreprise = await globalPrisma.entreprises.findUnique({
                    where: { id: req.user.entrepriseId },
                    select: { dbName: true }
                });
                if (entreprise) {
                    req.user.dbName = entreprise.dbName;
                }
            }
            catch (error) {
                console.error('Error fetching entreprise dbName:', error);
            }
        }
        next();
    });
};
exports.authenticateToken = authenticateToken;
// Middleware pour SUPER_ADMIN uniquement
const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Accès refusé : Super Admin requis' });
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
// Middleware pour ADMIN ou SUPER_ADMIN (ancien comportement, accès complet)
const requireAdminOrSuperAdminRestricted = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Accès refusé : Authentification requise' });
    }
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
        return next();
    }
    return res.status(403).json({ message: 'Accès refusé : Admin ou Super Admin requis' });
};
exports.requireAdminOrSuperAdminRestricted = requireAdminOrSuperAdminRestricted;
// Middleware pour ADMIN ou SUPER_ADMIN
const requireAdminOrSuperAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ message: 'Accès refusé : Admin ou Super Admin requis' });
    }
    next();
};
exports.requireAdminOrSuperAdmin = requireAdminOrSuperAdmin;
// Middleware pour ADMIN, CAISSIER ou SUPER_ADMIN
const requireAdminOrCaissier = (req, res, next) => {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'CAISSIER' && req.user.role !== 'SUPER_ADMIN')) {
        return res.status(403).json({ message: 'Accès refusé : Admin, Caissier ou Super Admin requis' });
    }
    next();
};
exports.requireAdminOrCaissier = requireAdminOrCaissier;
// Middleware pour ADMIN, CAISSIER ou SUPER_ADMIN (ancien comportement, accès complet)
const requireAdminOrCaissierRestricted = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Accès refusé : Authentification requise' });
    }
    if (req.user.role === 'ADMIN' || req.user.role === 'CAISSIER' || req.user.role === 'SUPER_ADMIN') {
        return next();
    }
    return res.status(403).json({ message: 'Accès refusé : Admin, Caissier ou Super Admin requis' });
};
exports.requireAdminOrCaissierRestricted = requireAdminOrCaissierRestricted;
// Middleware pour vérifier que l'ADMIN opère dans sa propre entreprise
const requireSameEntreprise = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentification requise' });
    }
    // SUPER_ADMIN peut tout faire
    if (req.user.role === 'SUPER_ADMIN') {
        return next();
    }
    // ADMIN doit avoir une entrepriseId et elle doit correspondre à celle de l'utilisateur à créer
    if (req.user.role === 'ADMIN') {
        if (!req.user.entrepriseId) {
            return res.status(403).json({ message: 'Admin non associé à une entreprise' });
        }
        // Vérifier que l'utilisateur à créer appartient à la même entreprise
        if (req.body.entrepriseId && req.body.entrepriseId !== req.user.entrepriseId) {
            return res.status(403).json({ message: 'Vous ne pouvez créer des utilisateurs que pour votre entreprise' });
        }
    }
    next();
};
exports.requireSameEntreprise = requireSameEntreprise;
//# sourceMappingURL=auth.js.map