# 📦 Système de gestion d’inventaire – Frontend

Travail de session – **INF15122 : Bases de données 1**  
Session d’hiver 2026  
Université du Québec à Rimouski (UQAR)

---

## 🧾 Description du projet

Ce dépôt contient la **partie cliente (frontend)** du système de gestion d’inventaire développé pour  
[La fermenterie du Père Canuel](https://www.perecanuel.com/), une entreprise de transformation alimentaire spécialisée dans les produits fermentés.

L’application cliente permet d’interagir avec une base de données relationnelle via une [API REST](https://gitlab.uqar.ca/bd_travail-de-session/systeme-de-gestion-d-inventaire_backend), afin de :

- Gérer l’inventaire des **produits bruts**
- Gérer l’inventaire des **produits transformés**
- Suivre les **commandes**, la **production** et les **clients**
- Générer des **rapports analytiques** à l’aide de graphiques

Le frontend est une **application web statique** développée en **HTML, CSS (Bootstrap) et JavaScript**.

---

## 🛠️ Technologies utilisées

- **HTML5**
- **CSS3**
- **Bootstrap 5**
- **Font Awesome**
- **JavaScript (ES6)**
- **API REST** (backend externe)
- **Git / GitLab (UQAR)**

---

## 🔌 API Config

`assets/js/config.js`

```js
const API_BASE_URL = "http://localhost:8001/api";
```
