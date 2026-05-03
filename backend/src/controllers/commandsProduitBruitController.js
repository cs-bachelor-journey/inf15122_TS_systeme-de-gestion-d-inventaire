import { connectDatabase } from "../db/connectDatabase.js";

// Contrôleur pour créer une commande de produit brut (plusieurs items)
export const creerCommandeProduitBruit = async (req, res) => {
  const { id_fournisseur, items } = req.body;
  let connection;

  try {
    if (!id_fournisseur || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Fournisseur et au moins un produit requis" });
    }

    const status = "commander";
    const db = await connectDatabase();
    connection = await db.getConnection();

    console.log("Creating commande for fournisseur:", id_fournisseur);
    console.log("Items:", items);

    // Obtenir le prochain ID de commande
    const [maxResult] = await connection.query(`SELECT MAX(id) as maxId FROM CommandesProduitBrut`);
    let commandeId = (maxResult[0].maxId || 0) + 1;
    console.log("New commande ID:", commandeId);

    // Créer chaque item avec le même commande_id
    for (const item of items) {
      const query = `INSERT INTO CommandesProduitBrut (commande_id, id_produit, id_fournisseur, unite_price, quantite, status) VALUES (?, ?, ?, ?, ?, ?)`;
      const params = [commandeId, item.id_produit, id_fournisseur, item.unit_price, item.quantite, status];
       
      console.log("Executing query:", query, "with params:", params);
      await connection.query(query, params);
    }

    res.status(201).json({ 
      message: "Commande de produit brut créée avec succès",
      data: { id: commandeId }
    });
  } catch (error) {
    console.error("Erreur lors de la création de la commande", error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la création de la commande: " + error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour consulter les commandes de produits bruts (liste groupée par commande_id)
export const consulterCommandesProduitBruit = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();

    const [commandes] = await connection.query(`
        SELECT 
            cpb.commande_id,
            cpb.id_fournisseur,
            s.name AS fournisseur_name,
            cpb.status,
            cpb.created_at,
            COUNT(*) AS nb_produits,
            SUM(cpb.quantite) AS quantite_totale,
            SUM(cpb.unite_price * cpb.quantite) AS prix_total
        FROM CommandesProduitBrut cpb
        JOIN Suppliers s ON cpb.id_fournisseur = s.id
        GROUP BY cpb.commande_id, cpb.id_fournisseur, s.name, cpb.status, cpb.created_at
        ORDER BY cpb.commande_id DESC
    `);

    res.status(200).json({
      message: "Commandes de produits bruts consultées avec succès",
      data: commandes,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la consultation des commandes de produits bruts:",
      error,
    );
    res.status(500).json({
      message: "Erreur lors de la consultation des commandes de produits bruts",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour consulter les détails d'une commande (avec tous ses items)
export const consulterCommandeDetails = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    if (!id) {
      return res.status(400).json({ message: "ID de la commande requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    // Obtenir les infos de la commande
    const [commande] = await connection.query(
        `SELECT DISTINCT
            cpb.commande_id,
            cpb.id_fournisseur,
            s.name AS fournisseur_name,
            cpb.status,
            cpb.created_at
        FROM CommandesProduitBrut cpb
        JOIN Suppliers s ON cpb.id_fournisseur = s.id
        WHERE cpb.commande_id = ?`,
        [id]
    );

    if (!commande || commande.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // Obtenir les items de la commande
    const [items] = await connection.query(
        `SELECT 
            cpb.id_produit,
            p.nom AS product_name,
            cpb.unite_price,
            cpb.quantite
        FROM CommandesProduitBrut cpb
        JOIN RawProducts p ON cpb.id_produit = p.id
        WHERE cpb.commande_id = ?`,
        [id]
    );

    res.status(200).json({
      message: "Détails de la commande consultés avec succès",
      data: { ...commande[0], items }
    });
  } catch (error) {
    console.error(
      "Erreur lors de la consultation des détails de la commande:",
      error,
    );
    res.status(500).json({
      message: "Erreur lors de la consultation des détails de la commande",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour supprimer une commande de produit brut (supprime tous les items)
export const supprimerCommandeProduitBruit = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    if (!id) {
      return res.status(400).json({ message: "ID de la commande requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    // Supprimer tous les items avec le même commande_id
    await connection.query(`DELETE FROM CommandesProduitBrut WHERE commande_id = ?`, [id]);

    res
      .status(200)
      .json({ message: "Commande de produit brut supprimée avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la commande de produit brut:",
      error,
    );
    res.status(500).json({
      message: "Erreur lors de la suppression de la commande de produit brut",
    });
  } finally {
    if (connection) connection.release();
  }
};
