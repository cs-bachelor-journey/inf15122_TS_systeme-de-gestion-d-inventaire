import { connectDatabase } from "../db/connectDatabase.js";

export const getProduitsTransformes = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [produits] = await connection.query(`
      SELECT
        pt.id,
        pt.nom,
        pt.commentaires,
        COUNT(fp.id) AS nb_formats
      FROM ProduitTransform pt
      LEFT JOIN FormatProduit fp ON fp.produit_id = pt.id
      GROUP BY pt.id, pt.nom, pt.commentaires
      ORDER BY pt.nom
    `);

    res.status(200).json({
      message: "Produits transformés récupérés avec succès",
      data: produits,
    });
  } catch (error) {
    console.error("Erreur lors de la consultation des produits transformés:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const getProduitTransformeById = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [produits] = await connection.query(
      `SELECT id, nom, commentaires FROM ProduitTransform WHERE id = ?`,
      [numericId],
    );

    if (!produits || produits.length === 0) {
      return res.status(404).json({ message: "Produit transformé non trouvé" });
    }

    const produit = produits[0];

    const [formats] = await connection.query(
      `SELECT
        fp.id AS format_id,
        fp.nom_format,
        fp.stock_quantity,
        um.code AS unite_code,
        um.nom AS unite_nom
      FROM FormatProduit fp
      JOIN UnitesMesure um ON um.id = fp.unite_id
      WHERE fp.produit_id = ?
      ORDER BY fp.nom_format`,
      [numericId],
    );

    const [prix] = await connection.query(
      `SELECT
        ppt.id AS prix_id,
        ppt.format_id,
        fp.nom_format,
        ppt.client_type,
        ppt.quantite_min,
        ppt.prix
      FROM PrixProduitTransforme ppt
      JOIN FormatProduit fp ON fp.id = ppt.format_id
      WHERE fp.produit_id = ?
      ORDER BY fp.nom_format, ppt.client_type, ppt.quantite_min`,
      [numericId],
    );

    res.status(200).json({
      message: "Produit transformé récupéré avec succès",
      data: { ...produit, formats, prix },
    });
  } catch (error) {
    console.error("Erreur lors de la consultation du produit transformé:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const creerProduitTransforme = async (req, res) => {
  const { nom, commentaires } = req.body;
  let connection;

  try {
    if (!nom) {
      return res.status(400).json({ message: "Le nom du produit est requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    const [result] = await connection.query(
      `INSERT INTO ProduitTransform (nom, commentaires) VALUES (?, ?)`,
      [nom, commentaires || null],
    );

    const [newProduit] = await connection.query(
      `SELECT id, nom, commentaires FROM ProduitTransform WHERE id = ?`,
      [result.insertId],
    );

    res.status(201).json({
      message: "Produit transformé créé avec succès",
      data: newProduit[0],
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Un produit avec ce nom existe déjà" });
    }
    console.error("Erreur lors de la création du produit transformé:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const modifierProduitTransforme = async (req, res) => {
  const { id } = req.params;
  const { nom, commentaires } = req.body;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [existing] = await connection.query(
      `SELECT * FROM ProduitTransform WHERE id = ?`,
      [numericId],
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Produit transformé non trouvé" });
    }

    const current = existing[0];

    await connection.query(
      `UPDATE ProduitTransform SET nom = ?, commentaires = ? WHERE id = ?`,
      [nom ?? current.nom, commentaires !== undefined ? commentaires : current.commentaires, numericId],
    );

    res.status(200).json({ message: "Produit transformé modifié avec succès" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Un produit avec ce nom existe déjà" });
    }
    console.error("Erreur lors de la modification du produit transformé:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const supprimerProduitTransforme = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [existing] = await connection.query(
      `SELECT id FROM ProduitTransform WHERE id = ?`,
      [numericId],
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Produit transformé non trouvé" });
    }

    await connection.query(`DELETE FROM ProduitTransform WHERE id = ?`, [numericId]);

    res.status(200).json({ message: "Produit transformé supprimé avec succès" });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_CANNOT_DELETE") {
      return res.status(400).json({ message: "Impossible de supprimer: ce produit a des formats ou recettes associés" });
    }
    console.error("Erreur lors de la suppression du produit transformé:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const creerFormat = async (req, res) => {
  const { produit_id, nom_format, unite_id } = req.body;
  let connection;

  try {
    if (!produit_id || !nom_format || !unite_id) {
      return res.status(400).json({ message: "produit_id, nom_format et unite_id sont requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [produit] = await connection.query(
      `SELECT id FROM ProduitTransform WHERE id = ?`,
      [produit_id],
    );
    if (!produit || produit.length === 0) {
      return res.status(404).json({ message: "Produit transformé non trouvé" });
    }

    const [unite] = await connection.query(
      `SELECT id FROM UnitesMesure WHERE id = ?`,
      [unite_id],
    );
    if (!unite || unite.length === 0) {
      return res.status(404).json({ message: "Unité de mesure non trouvée" });
    }

    const [result] = await connection.query(
      `INSERT INTO FormatProduit (produit_id, nom_format, unite_id) VALUES (?, ?, ?)`,
      [produit_id, nom_format, unite_id],
    );

    const [newFormat] = await connection.query(
      `SELECT fp.id, fp.produit_id, pt.nom AS produit_nom, fp.nom_format, fp.stock_quantity, um.code AS unite_code
       FROM FormatProduit fp
       JOIN ProduitTransform pt ON pt.id = fp.produit_id
       JOIN UnitesMesure um ON um.id = fp.unite_id
       WHERE fp.id = ?`,
      [result.insertId],
    );

    res.status(201).json({
      message: "Format créé avec succès",
      data: newFormat[0],
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Ce format existe déjà pour ce produit" });
    }
    console.error("Erreur lors de la création du format:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const updateFormatStock = async (req, res) => {
  const { id } = req.params;
  const { stock_quantity, operation } = req.body;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID du format invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    if (operation === "add" || operation === "remove") {
      const qty = Number(stock_quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: "stock_quantity doit être un nombre positif" });
      }

      if (operation === "remove") {
        const [current] = await connection.query(
          `SELECT stock_quantity FROM FormatProduit WHERE id = ?`,
          [numericId],
        );
        if (!current || current.length === 0) {
          return res.status(404).json({ message: "Format non trouvé" });
        }
        if (current[0].stock_quantity < qty) {
          return res.status(400).json({ message: "Stock insuffisant" });
        }
        await connection.query(
          `UPDATE FormatProduit SET stock_quantity = stock_quantity - ? WHERE id = ?`,
          [qty, numericId],
        );
      } else {
        await connection.query(
          `UPDATE FormatProduit SET stock_quantity = stock_quantity + ? WHERE id = ?`,
          [qty, numericId],
        );
      }
    } else {
      if (stock_quantity === undefined || stock_quantity === null) {
        return res.status(400).json({ message: "stock_quantity est requis" });
      }
      if (Number(stock_quantity) < 0) {
        return res.status(400).json({ message: "Le stock ne peut pas être négatif" });
      }
      await connection.query(
        `UPDATE FormatProduit SET stock_quantity = ? WHERE id = ?`,
        [stock_quantity, numericId],
      );
    }

    res.status(200).json({ message: "Stock mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du stock:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const getInventaire = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [inventaire] = await connection.query(`
      SELECT
        pt.id AS produit_id,
        pt.nom AS produit_nom,
        fp.id AS format_id,
        fp.nom_format,
        fp.stock_quantity,
        um.code AS unite_code,
        um.nom AS unite_nom,
        (SELECT COUNT(*) FROM PrixProduitTransforme ppt WHERE ppt.format_id = fp.id) AS nb_prix
      FROM ProduitTransform pt
      JOIN FormatProduit fp ON fp.produit_id = pt.id
      JOIN UnitesMesure um ON um.id = fp.unite_id
      ORDER BY pt.nom, fp.nom_format
    `);

    const summary = await connection.query(`
      SELECT
        pt.nom AS produit_nom,
        COUNT(fp.id) AS nb_formats,
        SUM(fp.stock_quantity) AS stock_total
      FROM ProduitTransform pt
      LEFT JOIN FormatProduit fp ON fp.produit_id = pt.id
      GROUP BY pt.id, pt.nom
      ORDER BY pt.nom
    `);

    res.status(200).json({
      message: "Inventaire récupéré avec succès",
      data: {
        details: inventaire,
        summary: summary[0],
      },
    });
  } catch (error) {
    console.error("Erreur lors de la consultation de l'inventaire:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const setPrixProduitTransforme = async (req, res) => {
  const { format_id, client_type, quantite_min, prix } = req.body;
  let connection;

  try {
    if (!format_id || !client_type || prix === undefined) {
      return res.status(400).json({ message: "format_id, client_type et prix sont requis" });
    }

    const validTypes = ["particulier", "epicerie", "restaurant"];
    if (!validTypes.includes(client_type)) {
      return res.status(400).json({ message: `client_type invalide. Valeurs: ${validTypes.join(", ")}` });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [format] = await connection.query(
      `SELECT id FROM FormatProduit WHERE id = ?`,
      [format_id],
    );
    if (!format || format.length === 0) {
      return res.status(404).json({ message: "Format non trouvé" });
    }

    await connection.query(
      `INSERT INTO PrixProduitTransforme (format_id, client_type, quantite_min, prix)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE prix = VALUES(prix)`,
      [format_id, client_type, quantite_min || 1, prix],
    );

    res.status(201).json({ message: "Prix défini avec succès" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Ce palier de prix existe déjà pour ce format et ce type de client" });
    }
    console.error("Erreur lors de la définition du prix:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};
