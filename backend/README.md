# Système de Gestion d'Inventaire — PÈRE CANUEL

> Application complète de gestion d'inventaire pour une entreprise de production alimentaire. Le système permet de gérer les produits bruts, les fournisseurs, les produits transformés, les recettes, les commandes clients, les plans de production et les rapports analytiques.

---

## Table des matières

- [Système de Gestion d'Inventaire — PÈRE CANUEL](#système-de-gestion-dinventaire--père-canuel)
  - [Table des matières](#table-des-matières)
  - [1. Architecture du système](#1-architecture-du-système)
  - [2. Technologies utilisées](#2-technologies-utilisées)
  - [3. Prérequis](#3-prérequis)
  - [4. Déploiement](#4-déploiement)
    - [Déploiement avec Docker (recommandé)](#déploiement-avec-docker-recommandé)
      - [Étape 1 : Cloner le projet](#étape-1--cloner-le-projet)
      - [Étape 2 : Vérifier les fichiers de configuration](#étape-2--vérifier-les-fichiers-de-configuration)
      - [Étape 3 : Lancer l'application](#étape-3--lancer-lapplication)
      - [Étape 4 : Vérifier le déploiement](#étape-4--vérifier-le-déploiement)
      - [Étape 5 : Accéder à l'application](#étape-5--accéder-à-lapplication)
    - [Déploiement manuel (sans Docker)](#déploiement-manuel-sans-docker)
      - [Étape 1 : Installer MySQL](#étape-1--installer-mysql)
      - [Étape 2 : Créer la base de données](#étape-2--créer-la-base-de-données)
      - [Étape 3 : Installer les dépendances Node.js](#étape-3--installer-les-dépendances-nodejs)
      - [Étape 4 : Configurer les variables d'environnement](#étape-4--configurer-les-variables-denvironnement)
      - [Étape 5 : Lancer le serveur](#étape-5--lancer-le-serveur)
    - [Docker Secrets](#docker-secrets)
  - [5. Base de données](#5-base-de-données)
    - [Modèle relationnel](#modèle-relationnel)
      - [Description des tables](#description-des-tables)
    - [Données initiales](#données-initiales)
  - [6. Backend — API REST](#6-backend--api-rest)
    - [Produits Bruts (`/api/produits-bruts`)](#produits-bruts-apiproduits-bruts)
    - [Fournisseurs (`/api/fournisseurs`)](#fournisseurs-apifournisseurs)
    - [Commandes Produit Brut (`/api/commandes-produit-brut`)](#commandes-produit-brut-apicommandes-produit-brut)
    - [Clients (`/api/clients`)](#clients-apiclients)
    - [Commandes (Produits Transformés) (`/api/commandes`)](#commandes-produits-transformés-apicommandes)
    - [Produits Transformés (`/api/produits-transformes`)](#produits-transformés-apiproduits-transformes)
    - [Recettes (`/api/recettes`)](#recettes-apirecettes)
    - [Plans de Production (`/api/plans-production`)](#plans-de-production-apiplans-production)
    - [Rapports (`/api/rapport`)](#rapports-apirapport)
  - [7. Variables d'environnement](#7-variables-denvironnement)
  - [8. Membres de l'équipe](#8-membres-de-léquipe)

---

## 1. Architecture du système

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Navigateur)                     │
│  HTML5 + CSS3 + Bootstrap 5 + JavaScript (vanilla + Fetch)  │
│  http://localhost:8001 (pages statiques)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ Requêtes HTTP (JSON)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (API REST)                         │
│  Node.js 25 + Express 5 + ESM + mysql2/promise              │
│  http://localhost:8001/api                                   │
├─────────────────────────────────────────────────────────────┤
│  Controllers → Routes → Middleware → Réponses JSON           │
└──────────────────────┬──────────────────────────────────────┘
                       │ Requêtes SQL
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BASE DE DONNÉES MySQL                      │
│  perecanuel_db — 13 tables interconnectées                   │
│  Port: 3309 (externe) / 3306 (interne Docker)               │
│  Données initiales via init.sql                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technologies utilisées

| Couche              | Technologie    | Version     | Rôle                           |
| ------------------- | -------------- | ----------- | ------------------------------ |
| **Backend**         | Node.js        | 25 (Alpine) | Runtime JavaScript             |
|                     | Express        | 5.x         | Framework API REST             |
|                     | mysql2         | 3.x         | Client MySQL avec Promesses    |
|                     | dotenv         | —           | Variables d'environnement      |
|                     | nodemon        | —           | Rechargement à chaud (dev)     |
| **Base de données** | MySQL          | latest      | SGBD relationnelle             |
| **Frontend**        | HTML5          | —           | Structure des pages            |
|                     | CSS3           | —           | Styles personnalisés           |
|                     | Bootstrap      | —           | Framework UI responsive        |
|                     | JavaScript     | ES6+        | Logique cliente + Fetch API    |
| **Infrastructure**  | Docker         | —           | Conteneurisation               |
|                     | Docker Compose | —           | Orchestration multi-conteneurs |

---

## 3. Prérequis

Avant de déployer le système, assurez-vous d'avoir :

| Outil                                                      | Version minimum            | Vérification             |
| ---------------------------------------------------------- | -------------------------- | ------------------------ |
| [Docker](https://www.docker.com/get-started/)              | 24.0+                      | `docker --version`       |
| [Docker Compose](https://docs.docker.com/compose/install/) | 2.20+                      | `docker compose version` |
| Git                                                        | 2.30+                      | `git --version`          |
| Navigateur web                                             | Chrome/Firefox/Edge récent | —                        |

**Aucune installation locale de Node.js ou MySQL n'est nécessaire** — tout est géré par Docker.

---

## 4. Déploiement

### Déploiement avec Docker (recommandé)

#### Étape 1 : Cloner le projet

```bash
git clone https://gitlab.uqar.ca/bd_travail-de-session/systeme-de-gestion-d-inventaire_backend.git
cd systeme-de-gestion-d-inventaire_backend
```

#### Étape 2 : Vérifier les fichiers de configuration

Assurez-vous que ces fichiers existent à la racine du projet :

```
systeme-de-gestion-d-inventaire_backend/
├── .env                      # Variables d'environnement
├── database_password.txt     # Secret pour la connexion Node→MySQL
├── root_password.txt         # Secret pour le root MySQL
├── docker-compose.yaml       # Configuration Docker
├── Dockerfile                # Image Node.js
├── init.sql                  # Schéma + données initiales
├── utfconf.cnf               # Configuration UTF-8 MySQL
├── package.json              # Dépendances Node.js
└── src/                      # Code source backend
    ├── server.js
    ├── controllers/
    ├── routes/
    └── db/
```

#### Étape 3 : Lancer l'application

```bash
docker compose up --build
```

Cette commande va :

1. Construire l'image Node.js avec les dépendances
2. Démarrer MySQL et initialiser la base de données (schéma + données de test)
3. Démarrer le serveur Express et attendre que MySQL soit prêt
4. Activer le rechargement à chaud (nodemon) pour le développement

#### Étape 4 : Vérifier le déploiement

**Health Check de l'API :**

```bash
curl http://localhost:8001/health
```

Réponse attendue :

```json
{
  "status": "OK",
  "message": "Le serveur fonctionne correctement",
  "timestamp": "2026-05-02T12:00:00.000Z"
}
```

**Vérifier les conteneurs :**

```bash
docker compose ps
```

#### Étape 5 : Accéder à l'application

| Service     | URL                          | Description                       |
| ----------- | ---------------------------- | --------------------------------- |
| API Backend | http://localhost:8001        | Point d'entrée API                |
| API Health  | http://localhost:8001/health | État du serveur                   |
| MySQL       | localhost:3309               | Accès direct à la base de données |

### Déploiement manuel (sans Docker)

#### Étape 1 : Installer MySQL

```bash
# macOS
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt update && sudo apt install mysql-server
sudo systemctl start mysql
```

#### Étape 2 : Créer la base de données

```bash
mysql -u root -p < init.sql
```

#### Étape 3 : Installer les dépendances Node.js

```bash
npm install
```

#### Étape 4 : Configurer les variables d'environnement

Créez un fichier `.env` à la racine :

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_DATABASE=perecanuel_db
MYSQL_PASSWORD=admin
PORT=8001
```

#### Étape 5 : Lancer le serveur

```bash
# Développement (avec rechargement automatique)
npm run dev

# Production
npm start
```

### Docker Secrets

Les mots de passe sont gérés via Docker Secrets pour la sécurité :

| Fichier                 | Utilisé par  | Description                               |
| ----------------------- | ------------ | ----------------------------------------- |
| `root_password.txt`     | MySQL (root) | Mot de passe root de MySQL                |
| `database_password.txt` | Node.js      | Mot de passe pour la connexion Node→MySQL |

Ces fichiers contiennent un mot de passe par ligne. Par défaut : `admin`.

---

## 5. Base de données

### Modèle relationnel

La base de données `perecanuel_db` contient **13 tables** interconnectées :

#### Description des tables

| Table                         | Rôle                                           | Colonnes principales                                                                             |
| ----------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `UnitesMesure`                | Unités de mesure (kg, L, u, etc.)              | `id`, `code`, `nom`, `facteur_conversion`                                                        |
| `RawProducts`                 | Produits bruts / matières premières            | `id`, `nom`, `stock_quantity`, `unite_id`                                                        |
| `Suppliers`                   | Fournisseurs de matières premières             | `id`, `name`, `tel`, `email`, `web_site`                                                         |
| `RawProductsSuppliers`        | Association produits↔fournisseurs              | `supplier_id`, `rawproduct_id`                                                                   |
| `PrixFournisseurQuantite`     | Paliers de prix par quantité                   | `id`, `supplier_id`, `rawproduct_id`, `quantite_min`, `prix_unitaire`                            |
| `CommandesProduitBrut`        | Commandes de matières premières                | `id`, `commande_id`, `id_produit`, `id_fournisseur`, `quantite`, `status`                        |
| `ProduitTransform`            | Produits finis (tartes, muffins, etc.)         | `id`, `nom`, `commentaires`                                                                      |
| `FormatProduit`               | Formats de produits (taille, conditionnement)  | `id`, `produit_id`, `nom_format`, `stock_quantity`, `unite_id`                                   |
| `RecettesProduit`             | Recettes (association format↔ingrédients)      | `format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`                 |
| `PrixProduitTransforme`       | Grille de prix par type de client              | `id`, `format_id`, `client_type`, `quantite_min`, `prix`                                         |
| `Clients`                     | Clients (particuliers, épiceries, restaurants) | `id`, `name`, `tel`, `email`, `client_type`, `adress`, `ville`                                   |
| `CommandesProduitTransformer` | Commandes de produits finis                    | `id`, `id_client`, `created_at`, `delivered_at`, `status`                                        |
| `LignesCommandeTransforme`    | Lignes de commande (produit×quantité)          | `id`, `commande_id`, `format_id`, `quantite`, `prix_unitaire`                                    |
| `PlanProduction`              | Plans de production planifiés                  | `id`, `id_format`, `quantite_plan`, `date_plan`, `plan_duration`, `real_duration`, `hourly_rate` |

### Données initiales

Le fichier `init.sql` insère automatiquement des données de test :

| Entité               | Quantité | Exemples                                                    |
| -------------------- | -------- | ----------------------------------------------------------- |
| Unités de mesure     | 11       | kg, g, L, mL, u, pce, caisse                                |
| Fournisseurs         | 5        | Fraises de Provence, Bio Équitable, Emballages Durand       |
| Produits bruts       | 15       | Fraise, Pomme, Farine, Sucre, Beurre, Lait                  |
| Produits transformés | 8        | Tarte aux fruits, Muffin myrtille, Cake, Panna cotta        |
| Formats              | 16       | Taille S/M/L, Muffin unitaire, Boîte de 6/12, Pot 250g/500g |
| Clients              | 9        | 3 particuliers, 3 épiceries, 3 restaurants                  |
| Recettes             | ~40      | Recettes pour chaque format de produit                      |
| Paliers de prix      | 16       | Prix dégressifs par quantité et type de client              |
| Commandes brut       | 8        | Commandes de matières premières (divers statuts)            |

---

## 6. Backend — API REST

**Base URL :** `http://localhost:8001/api`

L'API est organisée en **9 modules**. Chaque module suit le pattern `{ message: string, data: ... }`.

### Produits Bruts (`/api/produits-bruts`)

Gestion des matières premières et du stock.

| Méthode  | Endpoint                              | Description                                      |
| -------- | ------------------------------------- | ------------------------------------------------ |
| `GET`    | `/api/produits-bruts`                 | Lister tous les produits bruts                   |
| `GET`    | `/api/produits-bruts/:id`             | Détail d'un produit brut + fournisseurs associés |
| `GET`    | `/api/produits-bruts/par-fournisseur` | Produits bruts groupés par fournisseur           |
| `GET`    | `/api/produits-bruts/unites-mesure`   | Liste des unités de mesure                       |
| `POST`   | `/api/produits-bruts`                 | Ajouter un produit brut                          |
| `PUT`    | `/api/produits-bruts/:id`             | Modifier le nom d'un produit brut                |
| `DELETE` | `/api/produits-bruts/:id`             | Supprimer un produit brut                        |
| `POST`   | `/api/produits-bruts/stock-in/:id`    | Approvisionner (ajouter au stock)                |
| `POST`   | `/api/produits-bruts/stock-out/:id`   | Désapprovisionner (retirer du stock)             |

**Exemple — Lister les produits bruts :**

```bash
curl http://localhost:8001/api/produits-bruts
```

```json
{
  "message": "Produits bruts récupérés avec succès",
  "data": [
    { "id": 1, "nom": "Fraise", "stock_quantity": 150, "unite": "kg" },
    { "id": 9, "nom": "Farine", "stock_quantity": 100, "unite": "kg" }
  ]
}
```

**Exemple — Approvisionner :**

```bash
curl -X POST http://localhost:8001/api/produits-bruts/stock-in/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 50}'
```

### Fournisseurs (`/api/fournisseurs`)

Gestion des fournisseurs et des relations produits<->fournisseurs.

| Méthode  | Endpoint                                                                   | Description                                 |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| `GET`    | `/api/fournisseurs`                                                        | Lister tous les fournisseurs                |
| `GET`    | `/api/fournisseurs/:id`                                                    | Détail d'un fournisseur + produits associés |
| `POST`   | `/api/fournisseurs`                                                        | Ajouter un fournisseur                      |
| `PUT`    | `/api/fournisseurs/:id`                                                    | Mettre à jour un fournisseur                |
| `DELETE` | `/api/fournisseurs/:id`                                                    | Supprimer un fournisseur                    |
| `POST`   | `/api/fournisseurs/:supplierId/produits-bruts/:rawProductId`               | Associer un fournisseur à un produit brut   |
| `POST`   | `/api/fournisseurs/prix/:supplierId/produits-bruts/:rawProductId/quantite` | Créer un palier de prix                     |

**Exemple — Créer un palier de prix :**

```bash
curl -X POST http://localhost:8001/api/fournisseurs/prix/1/produits-bruts/1/quantite \
  -H "Content-Type: application/json" \
  -d '{"quantite_min": 50, "prix_unitaire": 5.50}'
```

### Commandes Produit Brut (`/api/commandes-produit-brut`)

Commandes de matières premières auprès des fournisseurs.

| Méthode  | Endpoint                          | Description                                                |
| -------- | --------------------------------- | ---------------------------------------------------------- |
| `GET`    | `/api/commandes-produit-brut`     | Lister toutes les commandes (regroupées par `commande_id`) |
| `GET`    | `/api/commandes-produit-brut/:id` | Détails d'une commande + articles                          |
| `POST`   | `/api/commandes-produit-brut`     | Créer une commande (multi-articles)                        |
| `DELETE` | `/api/commandes-produit-brut/:id` | Supprimer une commande                                     |

**Statuts valides :** `commander`, `expedie`, `recu`, `rupture de stock`

**Exemple — Créer une commande multi-articles :**

```bash
curl -X POST http://localhost:8001/api/commandes-produit-brut \
  -H "Content-Type: application/json" \
  -d '{
    "id_fournisseur": 1,
    "items": [
      { "id_produit": 1, "unit_price": 7.00, "quantite": 25 },
      { "id_produit": 4, "unit_price": 12.00, "quantite": 10 }
    ]
  }'
```

### Clients (`/api/clients`)

Gestion des clients et de leur historique.

| Méthode  | Endpoint                                       | Description                          |
| -------- | ---------------------------------------------- | ------------------------------------ |
| `GET`    | `/api/clients`                                 | Lister tous les clients              |
| `GET`    | `/api/clients/:id`                             | Détail d'un client + ses commandes   |
| `GET`    | `/api/clients/types`                           | Types de clients possibles           |
| `GET`    | `/api/clients/:id/historique-commandes`        | Historique des commandes d'un client |
| `GET`    | `/api/clients/:clientId/commandes/:commandeId` | Détail d'une commande spécifique     |
| `POST`   | `/api/clients`                                 | Ajouter un client                    |
| `PUT`    | `/api/clients/:id`                             | Mettre à jour un client              |
| `DELETE` | `/api/clients/:id`                             | Supprimer un client                  |

**Types de clients :** `particulier`, `epicerie`, `restaurant`

**Exemple — Ajouter un client :**

```bash
curl -X POST http://localhost:8001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Boulangerie Centrale",
    "tel": "+33 1 99 88 77 66",
    "email": "contact@boulangerie-centrale.fr",
    "web_site": "",
    "person_to_contact": "Marc Boulanger",
    "client_type": "epicerie",
    "adress": "5 Rue du Commerce",
    "ville": "Bordeaux",
    "region": "Nouvelle-Aquitaine"
  }'
```

### Commandes (Produits Transformés) (`/api/commandes`)

Gestion des commandes de produits finis par les clients.

| Méthode  | Endpoint                                     | Description                    |
| -------- | -------------------------------------------- | ------------------------------ |
| `GET`    | `/api/commandes`                             | Lister toutes les commandes    |
| `GET`    | `/api/commandes/:id`                         | Détail d'une commande + lignes |
| `POST`   | `/api/commandes`                             | Créer une commande vide        |
| `PUT`    | `/api/commandes/:id`                         | Modifier une commande          |
| `DELETE` | `/api/commandes/:id`                         | Supprimer une commande         |
| `PATCH`  | `/api/commandes/:id/statut`                  | Changer le statut              |
| `POST`   | `/api/commandes/:id/lignes`                  | Ajouter une ligne de commande  |
| `DELETE` | `/api/commandes/:commandeId/lignes/:ligneId` | Supprimer une ligne            |

**Statuts valides :** `commander`, `expedier`, `recu`, `rupture de stock`

> **Note :** Le statut `recu` définit automatiquement `delivered_at = NOW()`.

**Exemple — Changer le statut :**

```bash
curl -X PATCH http://localhost:8001/api/commandes/1/statut \
  -H "Content-Type: application/json" \
  -d '{"status": "recu"}'
```

### Produits Transformés (`/api/produits-transformes`)

Gestion des produits finis, formats, stock et prix.

| Méthode  | Endpoint                               | Description                                    |
| -------- | -------------------------------------- | ---------------------------------------------- |
| `GET`    | `/api/produits-transformes`            | Lister tous les produits transformés           |
| `GET`    | `/api/produits-transformes/:id`        | Détail + formats + prix                        |
| `GET`    | `/api/produits-transformes/inventaire` | Inventaire complet (tous les formats)          |
| `POST`   | `/api/produits-transformes`            | Créer un produit transformé                    |
| `PUT`    | `/api/produits-transformes/:id`        | Modifier un produit transformé                 |
| `DELETE` | `/api/produits-transformes/:id`        | Supprimer un produit transformé                |
| `POST`   | `/api/produits-transformes/formats`    | Créer un format                                |
| `PATCH`  | `/api/produits-transformes/:id/stock`  | Mettre à jour le stock d'un format             |
| `POST`   | `/api/produits-transformes/prix`       | Définir un prix (par format et type de client) |

**Exemple — Mettre à jour le stock :**

```bash
# Ajouter 20 unités
curl -X PATCH http://localhost:8001/api/produits-transformes/4/stock \
  -H "Content-Type: application/json" \
  -d '{"stock_quantity": 20, "operation": "add"}'

# Retirer 5 unités
curl -X PATCH http://localhost:8001/api/produits-transformes/4/stock \
  -H "Content-Type: application/json" \
  -d '{"stock_quantity": 5, "operation": "remove"}'

# Définir directement
curl -X PATCH http://localhost:8001/api/produits-transformes/4/stock \
  -H "Content-Type: application/json" \
  -d '{"stock_quantity": 100}'
```

### Recettes (`/api/recettes`)

Gestion des recettes (ingrédients par format de produit).

| Méthode  | Endpoint                                            | Description                                           |
| -------- | --------------------------------------------------- | ----------------------------------------------------- |
| `GET`    | `/api/recettes`                                     | Lister toutes les recettes (formats + nb ingrédients) |
| `GET`    | `/api/recettes/:id`                                 | Détail d'une recette + ingrédients + prix             |
| `POST`   | `/api/recettes`                                     | Créer une recette (multi-ingrédients)                 |
| `PUT`    | `/api/recettes/:id`                                 | Modifier les ingrédients d'une recette                |
| `DELETE` | `/api/recettes/:id`                                 | Supprimer une recette                                 |
| `POST`   | `/api/recettes/:id/matieres`                        | Ajouter un ingrédient                                 |
| `PUT`    | `/api/recettes/:id/matieres/:matiereId`             | Modifier un ingrédient                                |
| `DELETE` | `/api/recettes/:id/matieres/:matiereId`             | Retirer un ingrédient                                 |
| `GET`    | `/api/recettes/:id/matieres-necessaires?quantite=N` | Calculer les matières nécessaires pour N unités       |
| `PATCH`  | `/api/recettes/:id/validation`                      | Valider une recette (vérifier le stock)               |

**Exemple — Valider une recette pour 10 unités :**

```bash
curl -X PATCH http://localhost:8001/api/recettes/2/validation \
  -H "Content-Type: application/json" \
  -d '{"quantite": 10}'
```

Réponse :

```json
{
  "message": "Recette validée: toutes les matières sont disponibles",
  "data": {
    "valide": true,
    "format": {
      "id": 2,
      "produit_nom": "Tarte aux fruits",
      "nom_format": "Taille M (6 parts)"
    },
    "quantite_demandee": 10,
    "resultats": [
      {
        "produit_brut_nom": "Fraise",
        "stock_disponible": 150,
        "quantite_necessaire": 1333.33,
        "quantite_manquante": 0,
        "suffisant": true
      }
    ],
    "nb_manquants": 0
  }
}
```

### Plans de Production (`/api/plans-production`)

Planification et suivi de la production.

> **Format de réponse :** `{ success: boolean, data: ..., message: string }`

| Méthode  | Endpoint                                                        | Description                       |
| -------- | --------------------------------------------------------------- | --------------------------------- |
| `GET`    | `/api/plans-production`                                         | Lister tous les plans             |
| `GET`    | `/api/plans-production/:id`                                     | Détail d'un plan                  |
| `POST`   | `/api/plans-production`                                         | Créer un plan                     |
| `PUT`    | `/api/plans-production/:id`                                     | Mettre à jour un plan             |
| `DELETE` | `/api/plans-production/:id`                                     | Supprimer un plan                 |
| `PATCH`  | `/api/plans-production/:id/duree-planifiee`                     | Mettre à jour la durée planifiée  |
| `PATCH`  | `/api/plans-production/:id/duree-reelle`                        | Mettre à jour la durée réelle     |
| `PATCH`  | `/api/plans-production/:id/taux-horaire`                        | Mettre à jour le taux horaire     |
| `GET`    | `/api/plans-production/:id/matieres-necessaires`                | Matières nécessaires pour ce plan |
| `GET`    | `/api/plans-production/:id/duree-production`                    | Durée + coût de production        |
| `GET`    | `/api/plans-production/comparaison-stock?date_debut=&date_fin=` | Besoins totaux sur une période    |

**Exemple — Comparaison de stock sur une période :**

```bash
curl "http://localhost:8001/api/plans-production/comparaison-stock?date_debut=2026-03-01&date_fin=2026-05-31"
```

### Rapports (`/api/rapport`)

Rapports analytiques et statistiques.

| Méthode | Endpoint                                                    | Description                       |
| ------- | ----------------------------------------------------------- | --------------------------------- |
| `GET`   | `/api/rapport/ventes`                                       | Quantité totale vendue            |
| `GET`   | `/api/rapport/ventes/produits`                              | Revenu par produit transformé     |
| `GET`   | `/api/rapport/profit`                                       | Profit total (revenus - coûts)    |
| `GET`   | `/api/rapport/couts-production`                             | Coût total des matières premières |
| `GET`   | `/api/rapport/couts-main-oeuvre`                            | Coût total de la main d'œuvre     |
| `GET`   | `/api/rapport/consommation-matieres-premieres`              | Consommation par matière première |
| `GET`   | `/api/rapport/evolution-matieres-premieres?Debut=&Datefin=` | Historique des achats de brut     |
| `GET`   | `/api/rapport/moyenne-par-periode?Debut=&Datefin=`          | Moyenne de commande par période   |

**Exemple — Profit total :**

```bash
curl http://localhost:8001/api/rapport/profit
```

```json
{
  "message": "Profit total",
  "data": [{ "profit": 1250.0 }]
}
```

---

## 7. Variables d'environnement

Le fichier `.env` configure la connexion entre le backend et la base de données :

```env
MYSQL_HOST=perecanuel_db       # Nom du service MySQL dans Docker
MYSQL_USER=root                # Utilisateur MySQL
MYSQL_DATABASE=perecanuel_db   # Nom de la base de données
MYSQL_PASSWORD=admin           # Mot de passe MySQL
PORT=8001                      # Port du serveur Express
```

| Variable         | Description                | Valeur par défaut                               | Requis |
| ---------------- | -------------------------- | ----------------------------------------------- | ------ |
| `MYSQL_HOST`     | Hôte de la base de données | `perecanuel_db` (Docker) / `localhost` (manuel) | Oui    |
| `MYSQL_USER`     | Utilisateur MySQL          | `root`                                          | Oui    |
| `MYSQL_DATABASE` | Nom de la base de données  | `perecanuel_db`                                 | Oui    |
| `MYSQL_PASSWORD` | Mot de passe MySQL         | `admin`                                         | Oui    |
| `PORT`           | Port d'écoute du serveur   | `8001`                                          | Non    |

---

## 8. Membres de l'équipe

1. Channel Elva Djietcheu Koungoue
2. Juan Esteban Figueroa Varela
3. Ismael Loko
4. Ambeu Chris Nathan N'Cho
5. Lovelyne Lauraine Yangué Tchawo

**Cours :** Bases de données I — Travail de session
**Établissement :** UQAR (Université du Québec à Rimouski)
