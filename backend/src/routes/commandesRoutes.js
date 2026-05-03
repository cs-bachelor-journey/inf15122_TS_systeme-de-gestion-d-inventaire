import express from "express";
import {
  consulterListeCommandes,
  consulterdetailsCommande,
  ajouterCommande,
  ajouterLigneCommande,
  modifierCommande,
  supprimerCommande,
  supprimerLigneCommande,
  changerStatus,
} from "../controllers/commandesControllers.js";

const commandesRoutes = express.Router();

commandesRoutes.get("/", consulterListeCommandes);
commandesRoutes.post("/", ajouterCommande);
commandesRoutes.get("/:id", consulterdetailsCommande);
commandesRoutes.put("/:id", modifierCommande);
commandesRoutes.delete("/:id", supprimerCommande);
commandesRoutes.patch("/:id/statut", changerStatus);
commandesRoutes.post("/:id/lignes", ajouterLigneCommande);
commandesRoutes.delete("/:commandeId/lignes/:ligneId", supprimerLigneCommande);

export default commandesRoutes;
