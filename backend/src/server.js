import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import produitsBrutsRoutes from "./routes/produitsBrutsRoutes.js";
import fournisseursRoutes from "./routes/fournisseursRoutes.js";
import commandsProduitBruitRouter from "./routes/commandsProduitBruitRoutes.js";
import clientsRoutes from "./routes/clientsRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import commandesRoutes from "./routes/commandesRoutes.js";
import produitsTransformesRoutes from "./routes/produitsTransformesRoutes.js";
import recettesRoutes from "./routes/recettesRoutes.js";
import RapportRoute from "./routes/RapportRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/produits-bruts", produitsBrutsRoutes);
app.use("/api/fournisseurs", fournisseursRoutes);
app.use("/api/commandes-produit-brut", commandsProduitBruitRouter);
app.use("/api/clients", clientsRoutes);
app.use("/api/plans-production", productionRoutes);
app.use("/api/commandes", commandesRoutes);
app.use("/api/produits-transformes", produitsTransformesRoutes);
app.use("/api/recettes", recettesRoutes);
app.use("/api/rapport", RapportRoute);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Le serveur fonctionne correctement",
    timestamp: new Date().toISOString(),
  });
});
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API de gestion d'inventaire" });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
