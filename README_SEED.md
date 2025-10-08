# Initialisation des Données (Seed)

Ce guide explique comment initialiser la base de données avec des données de démonstration.

## Commande d'exécution

```bash
cd Back-end
npm run seed
```

## Données créées

### Entreprise
- **Entreprise Démo** (Dakar, Sénégal)
- Devise: XOF (Francs CFA)

### Utilisateurs Administratifs

#### Super Admin
- Email: `superadmin@example.com`
- Mot de passe: `superadmin123`
- Rôle: Accès complet à toutes les fonctionnalités

#### Admin
- Email: `admin@demo.com`
- Mot de passe: `admin123`
- Rôle: Administration de l'entreprise "Entreprise Démo"

#### Caissier
- Email: `caissier@demo.com`
- Mot de passe: `caissier123`
- Rôle: Gestion des paiements et caisses

### Employés

#### Jean Dupont (Développeur)
- Email: `jean.dupont@example.com`
- Mot de passe: `employe123`
- Contrat: FIXE (500,000 XOF/mois)
- Statut: Actif

#### Marie Diop (Comptable)
- Email: `marie.diop@example.com`
- Mot de passe: `employe456`
- Contrat: FIXE (400,000 XOF/mois)
- Statut: Actif

#### Ahmed Sow (Technicien)
- Email: `ahmed.sow@example.com`
- Mot de passe: `employe789`
- Contrat: JOURNALIER (15,000 XOF/jour × 20 jours)
- Statut: Actif

## Données générées automatiquement

### Pointages
- **Jean Dupont**: Pointages d'arrivée et départ pour aujourd'hui
- **Marie Diop**: Pointages d'arrivée et départ pour hier

### Assiduité
- **Jean Dupont**: Présent aujourd'hui (arrivée 8:30)
- **Marie Diop**: Présent hier (arrivée 8:15)
- **Ahmed Sow**: Absent aujourd'hui

### Bulletins de paie
- Cycle de paie mensuel créé pour le mois en cours
- Bulletins générés pour tous les employés actifs
- Calcul automatique des déductions (CNSS 5.5%)

## Utilisation dans l'application

### Connexion employé
Les employés peuvent se connecter avec leurs identifiants et accéder à :
- Leur tableau de bord personnel
- Leurs pointages
- Leurs bulletins de paie
- Leur QR code de pointage

### Connexion administrative
- **Super Admin**: Accès à toutes les entreprises et fonctionnalités
- **Admin**: Gestion de l'entreprise assignée
- **Caissier**: Gestion des paiements

## Remarques importantes

1. **Sécurité**: Les mots de passe sont hashés avec bcrypt
2. **Unicité**: Le script vérifie l'existence des données avant de les créer
3. **Réutilisable**: Peut être exécuté plusieurs fois sans créer de doublons
4. **Test-friendly**: Données cohérentes pour les tests et démonstrations

## Structure des données

```
Entreprise Démo
├── Utilisateurs
│   ├── Super Admin
│   ├── Admin
│   └── Caissier
├── Employés
│   ├── Jean Dupont (Développeur)
│   ├── Marie Diop (Comptable)
│   └── Ahmed Sow (Technicien)
├── Pointages
├── Assiduité
└── Bulletins de paie