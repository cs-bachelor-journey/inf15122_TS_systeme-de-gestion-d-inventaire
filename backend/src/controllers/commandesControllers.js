import { connectDatabase } from "../db/connectDatabase.js";

const VALID_STATUSES = ["commander", "expedier", "recu", "rupture de stock"];

export const consulterListeCommandes = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [commandes] = await connection.query(`
      SELECT
        c.id,
        c.id_client,
        cl.name AS client_name,
        c.created_at,
        c.delivered_at,
        c.status,
        COUNT(l.id) AS nb_items,
        COALESCE(SUM(l.quantite), 0) AS quantite_totale,
        ROUND(COALESCE(SUM(l.quantite * l.prix_unitaire), 0), 2) AS montant_total
      FROM CommandesProduitTransformer c
      LEFT JOIN Clients cl ON cl.id = c.id_client
      LEFT JOIN LignesCommandeTransforme l ON l.commande_id = c.id
      GROUP BY c.id, c.id_client, cl.name, c.created_at, c.delivered_at, c.status
      ORDER BY c.created_at DESC
    `);

    res.status(200).json({
      message: "Liste des commandes récupérée avec succès",
      data: commandes,
    });
  } catch (error) {
    console.error("Erreur lors de la consultation des commandes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const consulterdetailsCommande = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID de la commande invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    const [rows] = await connection.query(
      `SELECT
        c.id,
        c.id_client,
        cl.name AS client_name,
        c.created_at,
        c.delivered_at,
        c.status
      FROM CommandesProduitTransformer c
      JOIN Clients cl ON cl.id = c.id_client
      WHERE c.id = ?`,
      [numericId],
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const commande = rows[0];

    const [items] = await connection.query(
      `SELECT
        l.id AS ligne_id,
        l.format_id,
        fp.nom_format,
        pt.nom AS produit_nom,
        l.quantite,
        l.prix_unitaire,
        ROUND(l.quantite * l.prix_unitaire, 2) AS sous_total
      FROM LignesCommandeTransforme l
      JOIN FormatProduit fp ON fp.id = l.format_id
      JOIN ProduitTransform pt ON pt.id = fp.produit_id
      WHERE l.commande_id = ?`,
      [numericId],
    );

    const montantTotal = items.reduce((sum, item) => sum + Number(item.sous_total), 0);

    res.status(200).json({
      message: "Commande consultée avec succès",
      data: { ...commande, items, montant_total: montantTotal.toFixed(2) },
    });
  } catch (error) {
    console.error("Erreur lors de la consultation de la commande:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const ajouterCommande = async (req, res) => {
  const { id_client, status } = req.body;
  let connection;

  try {
    if (!id_client) {
      return res.status(400).json({ message: "id_client est requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [client] = await connection.query(`SELECT id FROM Clients WHERE id = ?`, [id_client]);
    if (!client || client.length === 0) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    const [result] = await connection.query(
      "INSERT INTO CommandesProduitTransformer(id_client, status) VALUES (?, ?)",
      [id_client, status || "commander"],
    );

    const [newCommande] = await connection.query(
      `SELECT
        c.id,
        c.id_client,
        cl.name AS client_name,
        c.created_at,
        c.delivered_at,
        c.status
      FROM CommandesProduitTransformer c
      JOIN Clients cl ON cl.id = c.id_client
      WHERE c.id = ?`,
      [result.insertId],
    );

    res.status(201).json({
      message: "Commande ajoutée avec succès",
      data: newCommande[0],
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la commande:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la commande" });
  } finally {
    if (connection) connection.release();
  }
};

export const ajouterLigneCommande = async (req, res) => {
  const { id } = req.params;
  const { format_id, quantite, prix_unitaire } = req.body;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID de la commande invalide" });
    }

    if (!format_id || quantite === undefined || quantite <= 0 || !prix_unitaire) {
      return res.status(400).json({ message: "format_id, quantite et prix_unitaire sont requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [commande] = await connection.query(`SELECT id, status FROM CommandesProduitTransformer WHERE id = ?`, [numericId]);
    if (!commande || commande.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    if (commande[0].status === "recu") {
      return res.status(400).json({ message: "Impossible de modifier une commande déjà reçue" });
    }

    await connection.query(
      `INSERT INTO LignesCommandeTransforme (commande_id, format_id, quantite, prix_unitaire)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantite = VALUES(quantite), prix_unitaire = VALUES(prix_unitaire)`,
      [numericId, format_id, quantite, prix_unitaire],
    );

    const [items] = await connection.query(
      `SELECT
        l.id AS ligne_id,
        l.format_id,
        fp.nom_format,
        pt.nom AS produit_nom,
        l.quantite,
        l.prix_unitaire,
        ROUND(l.quantite * l.prix_unitaire, 2) AS sous_total
      FROM LignesCommandeTransforme l
      JOIN FormatProduit fp ON fp.id = l.format_id
      JOIN ProduitTransform pt ON pt.id = fp.produit_id
      WHERE l.commande_id = ?`,
      [numericId],
    );

    const montantTotal = items.reduce((sum, item) => sum + Number(item.sous_total), 0);

    res.status(201).json({
      message: "Ligne de commande ajoutée avec succès",
      data: { items, montant_total: montantTotal.toFixed(2) },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la ligne de commande:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la ligne de commande" });
  } finally {
    if (connection) connection.release();
  }
};

export const modifierCommande = async (req, res) => {
  const { id } = req.params;
  const { id_client, delivered_at, status } = req.body;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID de la commande invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [existing] = await connection.query(`SELECT * FROM CommandesProduitTransformer WHERE id = ?`, [numericId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const current = existing[0];

    await connection.query(
      `UPDATE CommandesProduitTransformer
       SET id_client = ?, delivered_at = ?, status = ?
       WHERE id = ?`,
      [
        id_client ?? current.id_client,
        delivered_at ?? current.delivered_at,
        status ?? current.status,
        numericId,
      ],
    );

    res.status(200).json({ message: "Commande modifiée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la modification de la commande:", error);
    res.status(500).json({ message: "Erreur lors de la modification de la commande" });
  } finally {
    if (connection) connection.release();
  }
};

export const supprimerCommande = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID de la commande invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [existing] = await connection.query(`SELECT id FROM CommandesProduitTransformer WHERE id = ?`, [numericId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    await connection.query("DELETE FROM CommandesProduitTransformer WHERE id = ?", [numericId]);

    res.status(200).json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_CANNOT_DELETE") {
      return res.status(400).json({ message: "Impossible de supprimer: cette commande a des lignes associées" });
    }
    console.error("Erreur lors de la suppression de la commande:", error);
    res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
  } finally {
    if (connection) connection.release();
  }
};

export const supprimerLigneCommande = async (req, res) => {
  const { commandeId, ligneId } = req.params;
  let connection;

  try {
    const numericCommandeId = Number(commandeId);
    const numericLigneId = Number(ligneId);
    if (isNaN(numericCommandeId) || isNaN(numericLigneId)) {
      return res.status(400).json({ message: "IDs invalides" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [commande] = await connection.query(`SELECT id, status FROM CommandesProduitTransformer WHERE id = ?`, [numericCommandeId]);
    if (!commande || commande.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    if (commande[0].status === "recu") {
      return res.status(400).json({ message: "Impossible de modifier une commande déjà reçue" });
    }

    const [result] = await connection.query(
      "DELETE FROM LignesCommandeTransforme WHERE id = ? AND commande_id = ?",
      [numericLigneId, numericCommandeId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ligne de commande non trouvée" });
    }

    res.status(200).json({ message: "Ligne de commande supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la ligne de commande:", error);
    res.status(500).json({ message: "Erreur lors de la suppression de la ligne de commande" });
  } finally {
    if (connection) connection.release();
  }
};

export const changerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID de la commande invalide" });
    }

    if (!status) {
      return res.status(400).json({ message: "status requis" });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status invalide. Valeurs acceptées: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [existing] = await connection.query(`SELECT id FROM CommandesProduitTransformer WHERE id = ?`, [numericId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const updateFields = [status, numericId];
    if (status === "recu") {
      await connection.query(
        `UPDATE CommandesProduitTransformer SET status = ?, delivered_at = NOW() WHERE id = ?`,
        updateFields,
      );
    } else {
      await connection.query(
        `UPDATE CommandesProduitTransformer SET status = ? WHERE id = ?`,
        [status, numericId],
      );
    }

    res.status(200).json({ message: "Statut modifié avec succès" });
  } catch (error) {
    console.error("Erreur lors de la modification du statut de la commande:", error);
    res.status(500).json({ message: "Erreur lors de la modification du statut de la commande" });
  } finally {
    if (connection) connection.release();
  }
};
