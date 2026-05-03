import express from "express";
import {
  getRecettes,
  getRecetteById,
  creerRecette,
  modifierRecette,
  supprimerRecette,
  ajouterMatiere,
  modifierMatiere,
  supprimerMatiere,
  getMatieresNecessaires,
  validerRecette,
} from "../controllers/recettesController.js";

const recettesRouter = express.Router();

recettesRouter.get("/", getRecettes);
recettesRouter.post("/", creerRecette);
recettesRouter.get("/:id", getRecetteById);
recettesRouter.put("/:id", modifierRecette);
recettesRouter.delete("/:id", supprimerRecette);

recettesRouter.get("/:id/matieres-necessaires", getMatieresNecessaires);
recettesRouter.patch("/:id/validation", validerRecette);
recettesRouter.post("/:id/matieres", ajouterMatiere);
recettesRouter.put("/:id/matieres/:matiereId", modifierMatiere);
recettesRouter.delete("/:id/matieres/:matiereId", supprimerMatiere);

export default recettesRouter;
