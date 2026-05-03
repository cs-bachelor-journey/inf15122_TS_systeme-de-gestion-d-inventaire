import express from "express";
import {
  consulterProduitsBruts,
  consulterProduitBrut,
  ajouterProduitBrut,
  modifierProduitBrut,
  supprimerProduitBrut,
  approvisionnerProduitBrut,
  desapprovisionnerProduitBrut,
  consulterProduitsBrutsParFournisseur,
  getUnitesMesure,
} from "../controllers/produitsBrutsController.js";

const produitsBrutsRoutes = express.Router();

produitsBrutsRoutes.get("/unites-mesure", getUnitesMesure);
produitsBrutsRoutes.get("/", consulterProduitsBruts);
produitsBrutsRoutes.get(
  "/par-fournisseur",
  consulterProduitsBrutsParFournisseur,
);
produitsBrutsRoutes.post("/", ajouterProduitBrut);
produitsBrutsRoutes.put("/:id", modifierProduitBrut);
produitsBrutsRoutes.delete("/:id", supprimerProduitBrut);
produitsBrutsRoutes.post("/stock-in/:id", approvisionnerProduitBrut);
produitsBrutsRoutes.post("/stock-out/:id", desapprovisionnerProduitBrut);
produitsBrutsRoutes.get("/:id", consulterProduitBrut);

export default produitsBrutsRoutes;
