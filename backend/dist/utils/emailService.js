"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    transporter;
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendConfirmationEmail(email, code, employeeName) {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Confirmation de votre compte employé',
            html: `
        <h1>Bonjour ${employeeName}</h1>
        <p>Votre compte employé a été créé avec succès.</p>
        <p>Pour recevoir votre code QR de pointage, veuillez entrer le code de confirmation suivant :</p>
        <h2>${code}</h2>
        <p>Utilisez ce code dans l'application pour obtenir votre QR code.</p>
        <p>Cordialement,<br>L'équipe RH</p>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Email de confirmation envoyé à ${email}`);
        }
        catch (error) {
            console.error('Erreur envoi email:', error);
            // Pour le développement, log le code
            console.log(`Code de confirmation pour ${email}: ${code}`);
        }
    }
    async sendWelcomeEmail(email, password, qrCode, employeeName) {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Bienvenue - Vos identifiants et QR code de pointage',
            html: `
        <h1>Bonjour ${employeeName}</h1>
        <p>Votre compte employé a été créé avec succès.</p>
        <p><strong>Vos identifiants de connexion :</strong></p>
        <ul>
          <li><strong>Email :</strong> ${email}</li>
          <li><strong>Mot de passe :</strong> ${password}</li>
        </ul>
        <p><strong>Votre code QR de pointage :</strong></p>
        <p>Utilisez ce code QR pour vous pointer automatiquement via l'application mobile ou le scanner.</p>
        <pre style="background-color: #f4f4f4; padding: 10px; border: 1px solid #ddd; font-family: monospace;">${qrCode}</pre>
        <p>Vous pouvez également accéder à votre espace employé à l'adresse suivante :</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/employee-login">Connexion employé</a></p>
        <p>Cordialement,<br>L'équipe RH</p>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Email de bienvenue envoyé à ${email}`);
        }
        catch (error) {
            console.error('Erreur envoi email:', error);
            // Pour le développement, log les informations
            console.log(`Informations pour ${email}:`);
            console.log(`Mot de passe: ${password}`);
            console.log(`QR Code: ${qrCode}`);
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map