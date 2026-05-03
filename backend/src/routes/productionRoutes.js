import express from "express";
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  updateDureePlanifiee,
  updateDureeReelle,
  updateTauxHoraire,
  getMatiereNecessaires,
  getDureeProduction,
  getComparaisonStock,
} from "../controllers/productionController.js";

const productionRouter = express.Router();

// Production plans CRUD
productionRouter.get("/", getAllPlans);
productionRouter.get("/:id", getPlanById);
productionRouter.post("/", createPlan);
productionRouter.put("/:id", updatePlan);
productionRouter.delete("/:id", deletePlan);

// Partial updates
productionRouter.patch("/:id/duree-planifiee", updateDureePlanifiee);
productionRouter.patch("/:id/duree-reelle", updateDureeReelle);
productionRouter.patch("/:id/taux-horaire", updateTauxHoraire);

// Calculations
productionRouter.get("/:id/matieres-necessaires", getMatiereNecessaires);
productionRouter.get("/:id/duree-production", getDureeProduction);

// Stock comparison
productionRouter.get("/comparaison-stock", getComparaisonStock);

export default productionRouter;
