# Valentynia

> **Valentynia — L'humain, simplement.**

Plateforme SaaS de gestion RH pour PME, avec facturation électronique conforme
à la réforme 2026 (Factur-X + Portail Public de Facturation), suivi de la
conformité légale et assistant IA RH. Deux espaces : **entreprise** et
**salarié**.

Projet réalisé dans le cadre du titre professionnel **Développeur Web et Web
Mobile (DWWM)**.

---

## Monorepo

| Dossier      | Rôle                                                                   |
|--------------|----------------------------------------------------------------------|
| `frontend/`  | React 18 + Vite 5 + TypeScript + Tailwind CSS 3 + React Router 6       |
| `backend/`   | Node.js + Express 4 + TypeScript + Prisma 5 (PostgreSQL)              |

---

## Démarrage rapide

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Le frontend fonctionne seul, avec un jeu de données de démonstration
(`src/data/mock.ts`) et un store réactif persisté dans le `localStorage`.
Quand le backend tourne, l'appel `/api` est relayé vers `http://localhost:4000`
(proxy Vite).

### Backend

```bash
cd backend
cp .env.example .env    # renseigner DATABASE_URL, JWT_SECRET (32+ car.), AES_KEY (64 hex)
npm install
npx prisma migrate dev  # crée le schéma PostgreSQL
npm run seed            # jeu de données de démonstration
npm run dev             # http://localhost:4000
```

Comptes de démonstration (après `seed`) :

| Rôle       | Identifiant                              | Mot de passe |
|------------|------------------------------------------|--------------|
| Entreprise | `camille.ferrand@atelier-lumen.fr`       | `demo1234`   |
| Salarié    | `yanis.moreau@atelier-lumen.fr`          | `demo1234`   |

---

## Fonctionnalités

### Ressources humaines
Dossier salarié (RIB / n° de sécurité sociale chiffrés au repos), absences et
congés avec workflow de validation et soldes automatiques, planning et temps de
travail, onboarding / offboarding, documents RH (coffre-fort), entretiens
annuels et professionnels, cartographie des compétences, portail salarié
autonome.

### Facturation — réforme 2026
Génération **Factur-X** (facture hybride : PDF/A-3 lisible + XML CII UN/CEFACT,
profil EN 16931), transmission au **Portail Public de Facturation** (client en
mode simulation tant que les accès de production ne sont pas fournis), archivage
légal 10 ans à valeur probante (empreinte SHA-256), **journal anti-fraude TVA**
chaîné (chaque écriture inclut l'empreinte de la précédente — inaltérabilité).

### Conformité légale
Vérification automatique des clauses obligatoires des contrats, alertes légales
et échéances, suivi des obligations RH (DUERP, entretiens, registre du
personnel), registre RGPD.

### Assistant IA RH
Assistant conversationnel au ton calme et professionnel, génération de documents
RH à partir de modèles, analyses agrégées et strictement anonymes (climat
social, signaux faibles, prévision d'absences). La couche LLM (`askLlm`) est un
point d'extension : les réponses sont aujourd'hui générées localement par
règles.

---

## Architecture

- **Modulaire.** Chaque domaine métier (`auth`, `hr`, `billing`, `compliance`,
  `ai`) est isolé côté backend (`src/modules/*`) comme côté frontend
  (`src/pages/company/*`, `src/pages/employee/*`).
- **API REST.** Un routeur Express par module, validation des entrées avec
  **Zod**, gestion d'erreurs centralisée.
- **Base de données relationnelle.** Modèle Prisma (PostgreSQL) : entreprises,
  comptes, salariés, absences, documents, entretiens, compétences, bulletins,
  plannings, factures + lignes, événements PPF, journal TVA, alertes légales,
  insights IA.
- **Sécurité.** Authentification **JWT**, mots de passe hachés **bcrypt**
  (coût 12), en-têtes **Helmet**, CORS restreint, chiffrement **AES-256-GCM**
  des données sensibles au repos (`backend/src/lib/crypto.ts`).
- **Facturation 2026.** XML CII EN 16931 (`backend/src/lib/facturx.ts`), client
  PPF (`backend/src/lib/ppf.ts`), journal chaîné (`backend/src/lib/vatJournal.ts`).

---

## Stack technique

| Côté        | Technologies                                                            |
|-------------|----------------------------------------------------------------------|
| Frontend    | React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router 6          |
| Backend     | Node.js, Express 4, TypeScript 5, Prisma 5, PostgreSQL, Zod            |
| Sécurité    | JWT (jsonwebtoken), bcryptjs, Helmet, CORS, AES-256-GCM (node:crypto)  |
| Qualité     | ESLint, `tsc --noEmit` (typecheck strict)                              |
| Déploiement | Netlify (frontend, SPA) — voir `frontend/netlify.toml`                 |

---

## Scripts (racine)

```bash
npm run install:all      # installe frontend + backend
npm run dev:frontend     # démarre le frontend
npm run dev:backend      # démarre le backend
npm run build            # build frontend + backend
npm run typecheck        # vérification TypeScript des deux paquets
npm run prisma:migrate   # migration Prisma
npm run seed             # amorçage des données de démonstration
```

---

## Identité visuelle

Neutre chaud + un seul accent rose. Palette (`frontend/tailwind.config.js`) :

| Nom          | Hex       | Usage                                             |
|--------------|-----------|--------------------------------------------------|
| `cream`      | `#FAF9F8` | Fond de page                                      |
| `wash`       | `#F2EFEC` | Tuiles, hover, onglets, lignes de tableau         |
| `line`       | `#E9E5E2` | Bordures et séparateurs                           |
| `prune`      | `#232022` | Texte courant et titres                           |
| `mauve`      | `#6E655C` | Texte secondaire                                  |
| `powder`     | `#C25A76` | Accent : boutons principaux, liens, état actif    |
| `powderdark` | `#AB4A64` | Hover de l'accent                                 |
| `sage`       | `#D8E7DE` | Succès / validation                               |

Typographies : Montserrat SemiBold (titres), Playfair Display Medium
(sous-titres premium), Inter (texte), Roboto Mono (chiffres et tableaux).

---

## État d'avancement

- [x] Design system + charte graphique
- [x] Site vitrine (accueil, tarifs)
- [x] Authentification (UI + API JWT)
- [x] Espace entreprise (tableau de bord + 11 modules)
- [x] Espace salarié (documents, bulletins, demandes, planning, profil, IA)
- [x] Schéma PostgreSQL (Prisma) + API REST modulaire
- [x] Factur-X (XML CII EN 16931) + client PPF (simulation) + journal TVA chaîné
- [x] Chiffrement AES-256-GCM des données sensibles
- [ ] Branchement complet du frontend sur l'API (aujourd'hui : store de démo)
- [ ] Intégration réelle de l'API PPF (en attente des accès de production)
- [ ] Connexion de l'assistant IA à un fournisseur LLM
- [ ] Tests automatisés (unitaires + e2e)
- [ ] Déploiement du backend + base managée
