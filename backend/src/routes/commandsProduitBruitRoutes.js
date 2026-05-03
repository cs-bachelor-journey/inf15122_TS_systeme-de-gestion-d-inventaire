import express from "express";
import {
  creerCommandeProduitBruit,
  consulterCommandesProduitBruit,
  supprimerCommandeProduitBruit,
  consulterCommandeDetails,
} from "../controllers/commandsProduitBruitController.js";

const commandsProduitBruitRouter = express.Router();

commandsProduitBruitRouter.post("/", creerCommandeProduitBruit);
commandsProduitBruitRouter.get("/", consulterCommandesProduitBruit);
commandsProduitBruitRouter.get("/:id", consulterCommandeDetails);
commandsProduitBruitRouter.delete("/:id", supprimerCommandeProduitBruit);

export default commandsProduitBruitRouter;
