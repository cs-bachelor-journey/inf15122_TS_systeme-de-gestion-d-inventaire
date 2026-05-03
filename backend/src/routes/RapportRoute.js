import express from "express";
import {
  RapportVentesParProduit,
  EvolutionVentesMensuelles,
  RapportCoutsProductionParProduit,
  RapportConsommationProduitsBruts,
  RapportConsommationMensuelle,
  MoyenneConsommationParPeriode,
} from "../controllers/RapportControllers.js";

const RapportRoute = express.Router();

// Rapport des ventes par produit (quantités, revenus, coûts, profit) avec filtrage par période
RapportRoute.get("/ventes/produits", RapportVentesParProduit);

// Rapport de suivi de l'évolution des ventes mois par mois
RapportRoute.get("/ventes/evolution-mensuelle", EvolutionVentesMensuelles);

// Rapport des coûts de production par produit (matières premières + main d'œuvre)
RapportRoute.get(
  "/couts-production/produits",
  RapportCoutsProductionParProduit,
);

// Rapport de consommation des produits bruts (total)
RapportRoute.get(
  "/consommation/produits-bruts",
  RapportConsommationProduitsBruts,
);

// Rapport de consommation des produits bruts mois par mois
RapportRoute.get("/consommation/mensuelle", RapportConsommationMensuelle);

// Rapport de moyenne de consommation par période donnée
RapportRoute.get(
  "/consommation/moyenne-periode",
  MoyenneConsommationParPeriode,
);

export default RapportRoute;
