# Travail de session: développement d'un système de gestion d'inventaire pour une petite entreprise

**Cours INF15122 Base de données 1 — Session d'hiver 2026**

> _Préparé par François Gosselin_

---

## 1. Mise en situation

Vous faites partie de l'équipe de développement d'une startup technologique située dans l'est du Québec qui développe des systèmes informatiques sur mesure pour les PME. Vous avez reçu un mandat pour développer un système de gestion d'inventaire pour une petite entreprise familiale de la région du Bas-Saint-Laurent: **La fermenterie du Père Canuel**.

Le système comprendra :

- Une base de données contenant l'information importante au fonctionnement de l'entreprise
- Une interface web permettant d'interagir avec la base de données

En collaboration avec vos collègues, vous devez procéder à la conception et au développement d'un système répondant aux besoins du client dans les délais prévus au contrat.

---

## 2. À propos de l'entreprise

**La fermenterie du Père Canuel** est une entreprise de transformation alimentaire qui se spécialise dans la production d'aliments fermentés. L'entreprise produit notamment du tempeh à base de pois ainsi que plusieurs produits dérivés.

### Canaux de vente :

- 🌐 Site web : [https://www.perecanuel.com/](https://www.perecanuel.com/) (vente via Shopify)
- 🏪 Épiceries locales
- 🛒 Marchés publics et événements
- 🍽️ Restaurants de la région

### Gestion actuelle de l'inventaire :

L'inventaire est séparé en deux parties :

1. **Produits bruts** : aliments non-transformés pour les recettes
2. **Produits transformés** : produits fabriqués et vendus aux clients

> ⚠️ Actuellement, le suivi est géré à l'aide de tableurs Excel.

---

## 3. Équipe et méthodologie de travail

| Aspect              | Détails                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| **Taille d'équipe** | 4 ou 5 personnes (exceptions rares)                                    |
| **Méthodologie**    | Approche agile inspirée                                                |
| **Outils**          | Trello ou similaire pour le suivi                                      |
| **Rencontres**      | Hebdomadaires avec l'auxiliaire responsable                            |
| **Objectifs**       | Suivi d'avancement, identification des blocages, répartition équitable |

> ⚠️ Une personne ne contribuant pas de manière satisfaisante pourrait être pénalisée.

---

## 4. Les technologies à utiliser

### 4.1 Technologies imposées ✅

- Une base de données relationnelle
- Un logiciel de gestion de projets
- Git + dépôt GitLab de l'UQAR
- Un logiciel pour l'illustration du schéma de la base de données
- Docker et Compose pour le déploiement

### 4.2 Technologies recommandées 💡

| Composant           | Suggestion                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| SGBD                | MySQL                                                                                                         |
| Gestion de projet   | [Trello](https://trello.com/fr)                                                                               |
| Schéma BD           | [DrawDB](https://www.drawdb.app/)                                                                             |
| Frontend            | Application web avec JavaScript                                                                               |
| Backend             | Python, PHP, JavaScript, C# (au choix)                                                                        |
| Architecture        | API REST recommandée                                                                                          |
| Alternative backend | [MySQL REST Service](https://dev.mysql.com/doc/dev/mysql-rest-service/latest/#what-is-the-mysql-rest-service) |

> 📝 Si vous choisissez des technologies autres que celles suggérées, faites approuver vos choix par l'auxiliaire.

---

## 4.3 Les fonctionnalités du système

### 4.3.1 Module d'inventaire des produits bruts

```markdown
📦 Liste de produits

- Quantité en stock, unité de mesure, prix unitaire moyen

🏭 Liste des fournisseurs

- Nom, téléphone, courriel, site web, personne contact

🔗 Liste des produits par fournisseur

- Association fournisseur/produit avec prix unitaire et unité

📋 Liste des commandes

- Produit, fournisseur, quantité, prix, dates (commande/réception), statut
- Statuts : commandé, expédié, reçu, rupture de stock
```

### 4.3.2 Module d'inventaire des produits transformés

```markdown
🛍️ Liste des produits transformés

- Quantité en inventaire, unité de mesure, commentaires

📜 Liste des recettes de produits

- Produits bruts composant chaque produit transformé
- Quantités, unités, quantité résultante

👥 Liste des clients

- Coordonnées complètes + type (particulier, épicerie, restaurant...)
- Adresse, ville, région

📋 Liste des commandes clients

- Produit, quantité, prix de vente, dates, statut

📅 Liste de production planifiée

- Quantité planifiée, dates, durée prévue/réelle, taux horaire

👁️ Vue production-inventaire

- Comparaison besoins production vs inventaire/commandes
- Identification des produits bruts manquants

👁️ Vue commande-inventaire

- Comparaison commandes vs inventaire/production planifiée
- Identification des produits insuffisants
```

### 4.3.3 Module rapports

| Rapport                            | Contenu                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 📊 Ventes par produit              | Quantités vendues, produit des ventes, coût de production, profit réalisé. Filtres par période + évolution mensuelle |
| 💰 Coûts de production par produit | Détail des coûts : produits bruts + main d'œuvre                                                                     |
| 📈 Consommation de produits bruts  | Tendances d'utilisation, évolution dans le temps, moyennes par période                                               |

### 4.3.4 Bonus : Interface avec l'API Shopify _(facultatif)_

> 🎁 Points bonis disponibles pour l'intégration de l'API Shopify afin de récupérer automatiquement les données des commandes et clients.

🔗 Documentation API : [https://shopify.dev/docs/api/admin-rest](https://shopify.dev/docs/api/admin-rest)

---

## 5. Les livrables

### 5.1 Échéancier et répartition des tâches

- Décomposition du projet en tâches attribuées aux membres
- Dates de début/fin + dépendances entre tâches
- Mise à jour dynamique dans l'outil de gestion de projet

### 5.2 Schéma de la base de données

- Représentation graphique des tables, vues, procédures et relations
- Outil informatique requis (schémas manuscrits refusés)

### 5.3 Implémentation du schéma de la base de données

- Création de toutes les tables, vues et procédures dans un SGBD relationnel
- Script automatisé `fichier.sql` pour recréer la BD depuis zéro
- Script séparé pour les données de test (démonstration)

### 5.4 Application cliente

- Application multiplateforme (web recommandée)
- Architecture : Frontend + Backend + Base de données
- Alternative : MySQL REST Service peut remplacer le backend → frontend statique (HTML/CSS/JS)

### 5.5 Documentation

- Fichier `README.md` en format Markdown dans le dépôt Git
- Doit inclure :
  - Étapes de déploiement de l'application : [visite ici](./backend/README.md)
  - Guide d'utilisation des fonctionnalités

🔗 Guide Markdown : [https://www.markdownguide.org/basic-syntax/](https://www.markdownguide.org/basic-syntax/)

---

## 6. Évaluation

| Critère                                                 | Pondération |
| ------------------------------------------------------- | ----------- |
| 🗓️ Tenue de réunions hebdomadaires + mise à jour tâches | **10%**     |
| 🤝 Collaboration via Git (branches, dépôt commun)       | **10%**     |
| 🗂️ Schéma de la base de données                         | **20%**     |
| ⚙️ Implémentation du schéma                             | **25%**     |
| 💻 Application cliente                                  | **20%**     |
| 📚 Documentation                                        | **15%**     |

---

> ℹ️ _Document préparé pour le cours INF15122 — Base de données 1 — UQAR — Session d'hiver 2026_

---

## Screenshots

|                                                                                     |                                                                                     |                                                                                     |                                                                                     |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| ![Screenshot 1](screenshots/Screenshot%202026-05-03%20at%201.05.15%E2%80%AFAM.png)  | ![Screenshot 2](screenshots/Screenshot%202026-05-03%20at%201.05.24%E2%80%AFAM.png)  | ![Screenshot 3](screenshots/Screenshot%202026-05-03%20at%201.05.38%E2%80%AFAM.png)  | ![Screenshot 4](screenshots/Screenshot%202026-05-03%20at%201.05.48%E2%80%AFAM.png)  |
| ![Screenshot 5](screenshots/Screenshot%202026-05-03%20at%201.06.02%E2%80%AFAM.png)  | ![Screenshot 6](screenshots/Screenshot%202026-05-03%20at%201.06.10%E2%80%AFAM.png)  | ![Screenshot 7](screenshots/Screenshot%202026-05-03%20at%201.06.16%E2%80%AFAM.png)  | ![Screenshot 8](screenshots/Screenshot%202026-05-03%20at%201.06.24%E2%80%AFAM.png)  |
| ![Screenshot 9](screenshots/Screenshot%202026-05-03%20at%201.06.47%E2%80%AFAM.png)  | ![Screenshot 10](screenshots/Screenshot%202026-05-03%20at%201.07.00%E2%80%AFAM.png) | ![Screenshot 11](screenshots/Screenshot%202026-05-03%20at%201.07.07%E2%80%AFAM.png) | ![Screenshot 12](screenshots/Screenshot%202026-05-03%20at%201.07.14%E2%80%AFAM.png) |
| ![Screenshot 13](screenshots/Screenshot%202026-05-03%20at%201.07.23%E2%80%AFAM.png) | ![Screenshot 14](screenshots/Screenshot%202026-05-03%20at%201.07.39%E2%80%AFAM.png) | ![Screenshot 15](screenshots/Screenshot%202026-05-03%20at%201.07.45%E2%80%AFAM.png) | ![Screenshot 16](screenshots/Screenshot%202026-05-03%20at%201.07.53%E2%80%AFAM.png) |
| ![Screenshot 17](screenshots/Screenshot%202026-05-03%20at%201.08.04%E2%80%AFAM.png) | ![Screenshot 18](screenshots/Screenshot%202026-05-03%20at%201.08.15%E2%80%AFAM.png) | ![Screenshot 19](screenshots/Screenshot%202026-05-03%20at%201.08.26%E2%80%AFAM.png) | ![Screenshot 20](screenshots/Screenshot%202026-05-03%20at%201.08.35%E2%80%AFAM.png) |
| ![Screenshot 21](screenshots/Screenshot%202026-05-03%20at%201.08.51%E2%80%AFAM.png) | ![Screenshot 22](screenshots/Screenshot%202026-05-03%20at%201.09.00%E2%80%AFAM.png) | ![Screenshot 23](screenshots/Screenshot%202026-05-03%20at%201.09.14%E2%80%AFAM.png) | ![Screenshot 24](screenshots/Screenshot%202026-05-03%20at%201.09.58%E2%80%AFAM.png) |
| ![Screenshot 25](screenshots/Screenshot%202026-05-03%20at%201.10.05%E2%80%AFAM.png) | ![Screenshot 26](screenshots/Screenshot%202026-05-03%20at%201.10.24%E2%80%AFAM.png) | ![Screenshot 27](screenshots/Screenshot%202026-05-03%20at%201.10.55%E2%80%AFAM.png) | ![Screenshot 28](screenshots/Screenshot%202026-05-03%20at%201.11.11%E2%80%AFAM.png) |
| ![Screenshot 29](screenshots/Screenshot%202026-05-03%20at%201.11.25%E2%80%AFAM.png) | ![Screenshot 30](screenshots/Screenshot%202026-05-03%20at%201.12.08%E2%80%AFAM.png) | ![Screenshot 31](screenshots/Screenshot%202026-05-03%20at%201.12.17%E2%80%AFAM.png) | ![Screenshot 32](screenshots/Screenshot%202026-05-03%20at%201.12.26%E2%80%AFAM.png) |
