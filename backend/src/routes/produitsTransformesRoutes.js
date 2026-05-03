import express from "express";
import {
  getProduitsTransformes,
  getProduitTransformeById,
  creerProduitTransforme,
  modifierProduitTransforme,
  supprimerProduitTransforme,
  creerFormat,
  updateFormatStock,
  getInventaire,
  setPrixProduitTransforme,
} from "../controllers/produitsTransformesController.js";

const produitsTransformesRouter = express.Router();

produitsTransformesRouter.get("/", getProduitsTransformes);
produitsTransformesRouter.get("/inventaire", getInventaire);
produitsTransformesRouter.post("/", creerProduitTransforme);
produitsTransformesRouter.get("/:id", getProduitTransformeById);
produitsTransformesRouter.put("/:id", modifierProduitTransforme);
produitsTransformesRouter.delete("/:id", supprimerProduitTransforme);
produitsTransformesRouter.patch("/:id/stock", updateFormatStock);

produitsTransformesRouter.post("/formats", creerFormat);
produitsTransformesRouter.post("/prix", setPrixProduitTransforme);

export default produitsTransformesRouter;
