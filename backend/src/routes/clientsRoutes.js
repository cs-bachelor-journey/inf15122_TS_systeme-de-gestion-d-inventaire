import express from "express";
import {
  consulterClients,
  ajouterClient,
  consulterClientParId,
  mettreAJourClient,
  supprimerClient,
  getHistoriqueCommandes,
  getCommandeDetails,
  getClientTypes,
} from "../controllers/clientsController.js";

const clientsRouter = express.Router();

clientsRouter.get("/", consulterClients);
clientsRouter.post("/", ajouterClient);
clientsRouter.get("/types", getClientTypes);
clientsRouter.get("/:id/historique-commandes", getHistoriqueCommandes);
clientsRouter.get("/:clientId/commandes/:commandeId", getCommandeDetails);
clientsRouter.get("/:id", consulterClientParId);
clientsRouter.put("/:id", mettreAJourClient);
clientsRouter.delete("/:id", supprimerClient);

export default clientsRouter;
