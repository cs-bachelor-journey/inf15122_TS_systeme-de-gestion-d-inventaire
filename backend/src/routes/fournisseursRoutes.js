import express from "express";
import {
  consulterFournisseurs,
  ajouterFournisseur,
  consulterFournisseurParId,
  supprimerFournisseur,
  mettreAJourFournisseur,
  associerFournisseurProduitBrut,
  creerPrixFournisseurQuantite,
} from "../controllers/fournisseursController.js";

const fournisseursRouter = express.Router();

fournisseursRouter.get("/", consulterFournisseurs);
fournisseursRouter.post("/", ajouterFournisseur);
fournisseursRouter.get("/:id", consulterFournisseurParId);
fournisseursRouter.delete("/:id", supprimerFournisseur);
fournisseursRouter.put("/:id", mettreAJourFournisseur);
fournisseursRouter.post(
  "/:supplierId/produits-bruts/:rawProductId",
  associerFournisseurProduitBrut,
);
fournisseursRouter.post(
  "/prix/:supplierId/produits-bruts/:rawProductId/quantite",
  creerPrixFournisseurQuantite,
);

export default fournisseursRouter;
