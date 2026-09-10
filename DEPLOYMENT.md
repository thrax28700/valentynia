# Déploiement de Valentynia

Architecture cible :

```
Navigateur ──HTTPS──> Netlify (frontend React, SPA)
                          │  fetch VITE_API_URL
                          ▼
                     Render (API Express + Prisma)
                          │  TLS
                          ▼
                     Neon (PostgreSQL managé)
```

| Composant | Hébergeur | Offre |
|-----------|-----------|-------|
| Base de données | Neon | Free |
| API (`backend/`) | Render — Web Service | Free |
| Frontend (`frontend/`) | Netlify | Free |

---

## 1. Base de données — Neon

Le projet Neon `valentynia` existe déjà (branche `production`, base `neondb`).
Récupérer les deux chaînes de connexion :

```bash
npx neon@latest connection-string production --project-id <ID> --pooled   # -> DATABASE_URL
npx neon@latest connection-string production --project-id <ID>            # -> DIRECT_URL
```

> Option : créer une branche dédiée (`npx neon@latest branches create --name prod`)
> pour isoler les données de production de celles du développement.

---

## 2. API — Render

### Création du service

1. **Render Dashboard → New → Blueprint**, sélectionner le dépôt `valentynia`.
   Render lit `render.yaml` et propose le service `valentynia-api`.
2. Renseigner les variables `sync: false` dans l'onglet **Environment** :

   | Variable | Valeur |
   |----------|--------|
   | `DATABASE_URL` | chaîne Neon **pooled** (`...-pooler...`), `?sslmode=require` |
   | `DIRECT_URL` | chaîne Neon **directe** (sans `-pooler`) |
   | `AES_KEY` | 64 caractères hex : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `CORS_ORIGIN` | URL Netlify du frontend (ex. `https://valentynia.netlify.app`) — renseignée après l'étape 3 |
   | `JWT_SECRET` | généré automatiquement par Render |

3. **Deploy**. Séquence exécutée :
   - build : `npm ci && npx prisma generate && npm run build` (typecheck + bundle esbuild → `dist/server.cjs`)
   - pre-deploy : `npx prisma migrate deploy` (applique les migrations)
   - start : `npm start` (`node dist/server.cjs`)
4. Vérifier `https://valentynia-api.onrender.com/api/health` → `{"status":"ok"}`.

### Amorçage (une fois)

Dans **Render → Shell** du service :

```bash
npm run seed
```

Crée les comptes de démonstration (`camille.ferrand@atelier-lumen.fr` / `demo1234`, etc.).

---

## 3. Frontend — Netlify

1. **Netlify → Add new site → Import an existing project**, dépôt `valentynia`.
2. Réglages de build :
   - **Base directory** : `frontend`
   - **Build command** : `npm run build` (défini dans `frontend/netlify.toml`)
   - **Publish directory** : `frontend/dist`
3. **Environment variables** :

   | Variable | Valeur |
   |----------|--------|
   | `VITE_API_URL` | `https://valentynia-api.onrender.com/api` |

4. **Deploy**. Récupérer l'URL (`https://<nom>.netlify.app`).
5. Retourner sur Render, mettre `CORS_ORIGIN` = cette URL, redéployer l'API.

---

## 4. Vérification de bout en bout

1. Ouvrir l'URL Netlify.
2. Se connecter avec `camille.ferrand@atelier-lumen.fr` / `demo1234`.
3. Vérifier le tableau de bord, créer une facture Factur-X, valider une absence.
4. Se connecter avec `yanis.moreau@atelier-lumen.fr` / `demo1234` → espace salarié.

> L'offre gratuite Render met le service en veille après 15 min d'inactivité ;
> la première requête suivante prend ~30 s (démarrage à froid).

---

## Rappel des variables d'environnement (`backend/.env`)

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | PostgreSQL, connexion *pooled* (application) |
| `DIRECT_URL` | PostgreSQL, connexion directe (`prisma migrate`) |
| `PORT` | port d'écoute (Render l'injecte) |
| `NODE_ENV` | `development` \| `test` \| `production` |
| `CORS_ORIGIN` | origine(s) autorisée(s), séparées par des virgules |
| `JWT_SECRET` | signature des jetons (≥ 32 caractères) |
| `JWT_EXPIRES_IN` | durée de validité des jetons (`1d`) |
| `AES_KEY` | chiffrement AES-256 au repos (64 hex) |
| `FACTURX_PROFILE` | profil Factur-X (`EN16931`) |
| `PPF_API_BASE_URL` / `PPF_API_TOKEN` / `PPF_SIREN_EMETTEUR` | Portail Public de Facturation — vides ⇒ client en mode simulation |
