"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function seed() {
    try {
        console.log('🌱 Début de l\'initialisation des données...');
        // 1. Créer l'entreprise démo
        console.log('📍 Création de l\'entreprise démo...');
        let entreprise = await prisma.entreprises.findFirst({
            where: { nom: 'Entreprise Démo' }
        });
        if (!entreprise) {
            entreprise = await prisma.entreprises.create({
                data: {
                    nom: 'Entreprise Démo',
                    adresse: 'Dakar, Sénégal',
                    paiement: 'XOF',
                    dbName: 'tenante',
                },
            });
        }
        // 2. Créer le Super Admin
        console.log('👑 Création du Super Admin...');
        const superAdmin = await prisma.users.upsert({
            where: { email: 'superadmin@example.com' },
            update: {},
            create: {
                email: 'superadmin@example.com',
                password: await bcrypt_1.default.hash('superadmin123', 10),
                role: 'SUPER_ADMIN',
                nom: 'Super Admin',
            },
        });
        // 3. Créer l'Admin de l'entreprise
        console.log('👨‍💼 Création de l\'Admin...');
        const admin = await prisma.users.upsert({
            where: { email: 'admin@demo.com' },
            update: {},
            create: {
                email: 'admin@demo.com',
                password: await bcrypt_1.default.hash('admin123', 10),
                role: 'ADMIN',
                nom: 'Admin Démo',
                entrepriseId: entreprise.id,
            },
        });
        // 4. Créer le Caissier
        console.log('💰 Création du Caissier...');
        const caissier = await prisma.users.upsert({
            where: { email: 'caissier@demo.com' },
            update: {},
            create: {
                email: 'caissier@demo.com',
                password: await bcrypt_1.default.hash('caissier123', 10),
                role: 'CAISSIER',
                nom: 'Caissier Démo',
                entrepriseId: entreprise.id,
            },
        });
        // 5. Créer le Vigil
        console.log('👮 Création du Vigil...');
        const vigil = await prisma.users.upsert({
            where: { email: 'vigil@demo.com' },
            update: {},
            create: {
                email: 'vigil@demo.com',
                password: await bcrypt_1.default.hash('vigil123', 10),
                role: 'VIGIL',
                nom: 'Vigil Démo',
                entrepriseId: entreprise.id,
            },
        });
        // 5. Créer les employés avec mots de passe
        console.log('👷 Création des employés...');
        const employees = [
            {
                nom: 'Jean Dupont',
                email: 'jean.dupont@example.com',
                password: await bcrypt_1.default.hash('employe123', 10),
                poste: 'Développeur',
                typeContrat: 'FIXE',
                tauxSalaire: 500000,
                coordonneesBancaires: 'SN123456789',
                actif: true,
                confirmationCode: null,
                entrepriseId: entreprise.id,
            },
            {
                nom: 'Marie Diop',
                email: 'marie.diop@example.com',
                password: await bcrypt_1.default.hash('employe456', 10),
                poste: 'Comptable',
                typeContrat: 'FIXE',
                tauxSalaire: 400000,
                coordonneesBancaires: 'SN987654321',
                actif: true,
                confirmationCode: null,
                entrepriseId: entreprise.id,
            },
            {
                nom: 'Ahmed Sow',
                email: 'ahmed.sow@example.com',
                password: await bcrypt_1.default.hash('employe789', 10),
                poste: 'Technicien',
                typeContrat: 'JOURNALIER',
                tauxSalaire: 15000,
                joursTravailles: 20,
                coordonneesBancaires: 'SN456789123',
                actif: true,
                confirmationCode: null,
                entrepriseId: entreprise.id,
            },
        ];
        const createdEmployees = [];
        for (const emp of employees) {
            const employee = await prisma.employee.upsert({
                where: { email: emp.email },
                update: {},
                create: emp,
            });
            createdEmployees.push(employee);
        }
        // 6. Créer un cycle de paie
        console.log('💸 Création du cycle de paie...');
        const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        let payRun = await prisma.payRun.findFirst({
            where: {
                periode: currentMonth,
                type: 'MENSUEL',
                entrepriseId: entreprise.id,
            },
        });
        if (!payRun) {
            payRun = await prisma.payRun.create({
                data: {
                    periode: currentMonth,
                    type: 'MENSUEL',
                    status: 'BROUILLON',
                    entrepriseId: entreprise.id,
                },
            });
        }
        // 7. Créer les bulletins de paie
        console.log('📄 Création des bulletins de paie...');
        for (const employee of createdEmployees) {
            const existingPayslip = await prisma.payslip.findFirst({
                where: {
                    employeeId: employee.id,
                    payRunId: payRun.id,
                },
            });
            if (!existingPayslip) {
                let brut = Number(employee.tauxSalaire);
                let deductions = 0;
                if (employee.typeContrat === 'JOURNALIER') {
                    brut = Number(employee.tauxSalaire) * (employee.joursTravailles || 20);
                }
                // Calcul des déductions (simplifié)
                deductions = brut * 0.055; // CNSS 5.5%
                await prisma.payslip.create({
                    data: {
                        employeeId: employee.id,
                        payRunId: payRun.id,
                        brut: brut,
                        deductions: deductions,
                        net: brut - deductions,
                        status: 'EN_ATTENTE',
                    },
                });
            }
        }
        // 8. Créer quelques pointages pour les employés
        console.log('⏰ Création des pointages...');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const pointages = [
            // Aujourd'hui
            {
                employeeId: createdEmployees[0].id,
                date: today,
                type: 'ARRIVEE',
                heure: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30),
                entrepriseId: entreprise.id,
            },
            {
                employeeId: createdEmployees[0].id,
                date: today,
                type: 'DEPART',
                heure: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30),
                entrepriseId: entreprise.id,
            },
            // Hier
            {
                employeeId: createdEmployees[1].id,
                date: yesterday,
                type: 'ARRIVEE',
                heure: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 15),
                entrepriseId: entreprise.id,
            },
            {
                employeeId: createdEmployees[1].id,
                date: yesterday,
                type: 'DEPART',
                heure: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 45),
                entrepriseId: entreprise.id,
            },
        ];
        for (const pointage of pointages) {
            const existing = await prisma.pointage.findFirst({
                where: {
                    employeeId: pointage.employeeId,
                    date: pointage.date,
                    type: pointage.type,
                }
            });
            if (!existing) {
                await prisma.pointage.create({
                    data: pointage,
                });
            }
        }
        // 9. Créer des enregistrements d'assiduité
        console.log('📊 Création des enregistrements d\'assiduité...');
        const attendances = [
            {
                employeeId: createdEmployees[0].id,
                date: today,
                status: 'PRESENT',
                arrivalTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30),
                entrepriseId: entreprise.id,
            },
            {
                employeeId: createdEmployees[1].id,
                date: yesterday,
                status: 'PRESENT',
                arrivalTime: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 15),
                entrepriseId: entreprise.id,
            },
            {
                employeeId: createdEmployees[2].id,
                date: today,
                status: 'ABSENT',
                entrepriseId: entreprise.id,
            },
        ];
        for (const attendance of attendances) {
            await prisma.attendance.upsert({
                where: {
                    employeeId_date: {
                        employeeId: attendance.employeeId,
                        date: attendance.date,
                    }
                },
                update: {},
                create: attendance,
            });
        }
        console.log('✅ Initialisation des données terminée avec succès !');
        console.log('\n📋 Comptes de démonstration créés :');
        console.log('=====================================');
        console.log('🔑 Super Admin:');
        console.log('   Email: superadmin@example.com');
        console.log('   Mot de passe: superadmin123');
        console.log('');
        console.log('👨‍💼 Admin:');
        console.log('   Email: admin@demo.com');
        console.log('   Mot de passe: admin123');
        console.log('');
        console.log('💰 Caissier:');
        console.log('   Email: caissier@demo.com');
        console.log('   Mot de passe: caissier123');
        console.log('');
        console.log('👮 Vigil:');
        console.log('   Email: vigil@demo.com');
        console.log('   Mot de passe: vigil123');
        console.log('');
        console.log('👷 Employés:');
        console.log('   jean.dupont@example.com / employe123');
        console.log('   marie.diop@example.com / employe456');
        console.log('   ahmed.sow@example.com / employe789');
        console.log('');
        console.log('🏢 Entreprise: Entreprise Démo (Dakar, Sénégal)');
    }
    catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des données:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seed();
//# sourceMappingURL=seed.js.map