import { z } from "zod";
export declare const userCreateSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<{
        SUPER_ADMIN: "SUPER_ADMIN";
        ADMIN: "ADMIN";
        CAISSIER: "CAISSIER";
        EMPLOYEE: "EMPLOYEE";
    }>;
    nom: z.ZodString;
    entrepriseId: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const userLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const employeeLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const entrepriseCreateSchema: z.ZodObject<{
    nom: z.ZodString;
    logo: z.ZodOptional<z.ZodString>;
    adresse: z.ZodString;
    paiement: z.ZodDefault<z.ZodString>;
    adminNom: z.ZodOptional<z.ZodString>;
    adminEmail: z.ZodOptional<z.ZodString>;
    adminPassword: z.ZodOptional<z.ZodString>;
    caissierNom: z.ZodOptional<z.ZodString>;
    caissierEmail: z.ZodOptional<z.ZodString>;
    caissierPassword: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const entrepriseUpdateSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    adresse: z.ZodOptional<z.ZodString>;
    paiement: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const userUpdateSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    nom: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        SUPER_ADMIN: "SUPER_ADMIN";
        ADMIN: "ADMIN";
        CAISSIER: "CAISSIER";
        EMPLOYEE: "EMPLOYEE";
    }>>;
    entrepriseId: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const employeeCreateSchema: z.ZodObject<{
    nom: z.ZodString;
    email: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    poste: z.ZodString;
    typeContrat: z.ZodEnum<{
        JOURNALIER: "JOURNALIER";
        FIXE: "FIXE";
        HONORAIRE: "HONORAIRE";
    }>;
    tauxSalaire: z.ZodNumber;
    joursTravailles: z.ZodOptional<z.ZodNumber>;
    coordonneesBancaires: z.ZodOptional<z.ZodString>;
    actif: z.ZodOptional<z.ZodBoolean>;
    entrepriseId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const employeeUpdateSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    poste: z.ZodOptional<z.ZodString>;
    typeContrat: z.ZodOptional<z.ZodEnum<{
        JOURNALIER: "JOURNALIER";
        FIXE: "FIXE";
        HONORAIRE: "HONORAIRE";
    }>>;
    tauxSalaire: z.ZodOptional<z.ZodNumber>;
    joursTravailles: z.ZodOptional<z.ZodNumber>;
    coordonneesBancaires: z.ZodOptional<z.ZodString>;
    actif: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const paymentCreateSchema: z.ZodObject<{
    montant: z.ZodNumber;
    mode: z.ZodEnum<{
        ESPECES: "ESPECES";
        VIREMENT_BANCAIRE: "VIREMENT_BANCAIRE";
        ORANGE_MONEY: "ORANGE_MONEY";
        WAVE: "WAVE";
    }>;
    date: z.ZodOptional<z.ZodString>;
    payslipId: z.ZodNumber;
}, z.core.$strip>;
export declare const paymentUpdateSchema: z.ZodObject<{
    montant: z.ZodOptional<z.ZodNumber>;
    mode: z.ZodOptional<z.ZodEnum<{
        ESPECES: "ESPECES";
        VIREMENT_BANCAIRE: "VIREMENT_BANCAIRE";
        ORANGE_MONEY: "ORANGE_MONEY";
        WAVE: "WAVE";
    }>>;
    date: z.ZodOptional<z.ZodString>;
    payslipId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const payRunCreateSchema: z.ZodObject<{
    periode: z.ZodString;
    type: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        BROUILLON: "BROUILLON";
        APPROUVE: "APPROUVE";
        CLOTURE: "CLOTURE";
    }>>;
}, z.core.$strip>;
export declare const payRunUpdateSchema: z.ZodObject<{
    periode: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        BROUILLON: "BROUILLON";
        APPROUVE: "APPROUVE";
        CLOTURE: "CLOTURE";
    }>>;
}, z.core.$strip>;
export declare const payslipUpdateSchema: z.ZodObject<{
    brut: z.ZodOptional<z.ZodNumber>;
    deductions: z.ZodOptional<z.ZodNumber>;
    net: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        PAYE: "PAYE";
        PARTIEL: "PARTIEL";
        EN_ATTENTE: "EN_ATTENTE";
    }>>;
}, z.core.$strip>;
export declare const congeRequestCreateSchema: z.ZodObject<{
    typeConge: z.ZodEnum<{
        ANNUEL: "ANNUEL";
        MALADIE: "MALADIE";
        SANS_SOLDE: "SANS_SOLDE";
        MATERNITE: "MATERNITE";
        PATERNITE: "PATERNITE";
        EXCEPTIONNEL: "EXCEPTIONNEL";
    }>;
    dateDebut: z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>;
    dateFin: z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>;
    motif: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const congeApproveSchema: z.ZodObject<{
    commentaireRH: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const congeRejectSchema: z.ZodObject<{
    commentaireRH: z.ZodString;
}, z.core.$strip>;
export type CongeRequestCreateInput = z.infer<typeof congeRequestCreateSchema>;
export type CongeApproveInput = z.infer<typeof congeApproveSchema>;
export type CongeRejectInput = z.infer<typeof congeRejectSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type EntrepriseCreateInput = z.infer<typeof entrepriseCreateSchema>;
export type EntrepriseUpdateInput = z.infer<typeof entrepriseUpdateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;
export type PayRunCreateInput = z.infer<typeof payRunCreateSchema>;
export type PayRunUpdateInput = z.infer<typeof payRunUpdateSchema>;
export type PayslipUpdateInput = z.infer<typeof payslipUpdateSchema>;
//# sourceMappingURL=validate.d.ts.map