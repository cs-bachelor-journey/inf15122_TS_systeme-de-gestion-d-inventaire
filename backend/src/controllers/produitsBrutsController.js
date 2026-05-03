import { connectDatabase } from "../db/connectDatabase.js";

// Contrôleur pour les produits bruts
export const consulterProduitsBruts = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [produitsBruits] = await connection.query(`
        SELECT pb.id, pb.nom, pb.stock_quantity, um.code AS unite
        FROM RawProducts pb
        JOIN UnitesMesure um
        ON pb.unite_id = um.id
        ORDER BY pb.nom`);

    res.status(200).json({
      message: "Produits bruts récupérés avec succès",
      data: produitsBruits,
    });
  } catch (error) {
    console.error("Erreur lors de la consultation des produits bruts:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la consultation des produits bruts" });
  } finally {
    if (connection) connection.release();
  }
};

// contrôleur pour consulter les produits bruts par fournisseur
export const consulterProduitsBrutsParFournisseur = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [fournisseur] = await connection.query(
      `SELECT 
      rp.nom AS produit,
      s.name AS fournisseur,
      um.code AS unite_code,
      um.nom AS unite_nom,
      pfq.quantite_min,
      pfq.prix_unitaire
      FROM RawProductsSuppliers rps
      JOIN Suppliers s   ON s.id  = rps.supplier_id
      JOIN RawProducts rp  ON rp.id = rps.rawproduct_id
      JOIN UnitesMesure um  ON um.id = rp.unite_id
      LEFT JOIN PrixFournisseurQuantite pfq 
      ON pfq.supplier_id = rps.supplier_id
      AND pfq.rawproduct_id = rps.rawproduct_id
      ORDER BY s.name, rp.nom, pfq.quantite_min`,
    );

    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    res.status(200).json({
      message: "Produits bruts par fournisseur récupérés avec succès",
      data: fournisseur,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la consultation des produits bruts par fournisseur:",
      error,
    );
    res.status(500).json({
      message:
        "Erreur lors de la consultation des produits bruts par fournisseur",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour consulter un produit brut par ID et ses fournisseurs associés
export const consulterProduitBrut = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    if (!id) {
      return res.status(400).json({ message: "ID du produit brut requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    const [produitBrut] = await connection.query(
      `SELECT pb.id, pb.nom, pb.stock_quantity, um.code AS unite
      FROM RawProducts pb
      JOIN UnitesMesure um
      ON pb.unite_id = um.id
      WHERE pb.id = ?`,
      [id],
    );

    if (!produitBrut) {
      return res.status(404).json({ message: "Produit brut non trouvé" });
    }

    const [fournisseurs] = await connection.query(
      `SELECT f.id, f.name, f.person_to_contact, f.tel
      FROM Suppliers f
      JOIN RawProductsSuppliers rps
      ON f.id = rps.supplier_id
      WHERE rps.rawproduct_id = ?`,
      [id],
    );

    // parlier de prix par quantité fournie par chaque fournisseur
    const [prixFournisseurs] = await connection.query(
      `SELECT pq.quantite_min, pq.prix_unitaire, f.name AS fournisseur
      FROM PrixFournisseurQuantite pq
      JOIN Suppliers f ON pq.supplier_id = f.id
      WHERE pq.rawproduct_id = ?`,
      [id],
    );

    res.status(200).json({
      message: "Produit brut récupéré avec succès",
      data: {
        ...produitBrut,
        fournisseurs,
        fournisseursTotal: fournisseurs.length,
        prixFournisseurs,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la consultation du produit brut:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la consultation du produit brut:" });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour ajouter un nouveau produit brut
export const ajouterProduitBrut = async (req, res) => {
  const { nom, stock_quantity, unite_id } = req.body;
  let connection;
  try {
    if (!nom || stock_quantity === undefined || !unite_id) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    const result = await connection.query(
      "INSERT INTO RawProducts (nom, stock_quantity, unite_id) VALUES (?, ?, ?)",
      [nom, stock_quantity, unite_id],
    );

    res.status(201).json({
      message: "Produit brut ajouté avec succès",
      data: { id: result[0].insertId, nom, stock_quantity, unite_id },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit brut:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du produit brut" });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour modifier un produit brut existant
export const modifierProduitBrut = async (req, res) => {
  const { id } = req.params;
  const { nom } = req.body;
  let connection;

  try {
    if (!id) {
      return res.status(400).json({ message: "ID du produit brut requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [produitBrut] = await connection.query(
      `UPDATE RawProducts
      SET nom = ?
      WHERE id = ?`,
      [nom, id],
    );

    if (produitBrut.affectedRows === 0) {
      return res.status(404).json({ message: "Produit brut non trouvé" });
    }

    res.status(200).json({
      message: "Produit brut modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la modification du produit brut:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la modification du produit brut" });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour supprimer un produit brut
export const supprimerProduitBrut = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    if (!id) {
      return res.status(400).json({ message: "ID du produit brut requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    const [result] = await connection.query("DELETE FROM RawProducts WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produit brut non trouvé" });
    }

    res.status(200).json({
      message: "Produit brut supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit brut:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du produit brut" });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour approvisionner un produit brut
export const approvisionnerProduitBrut = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  let connection;
  try {
    if (!id || quantity === undefined) {
      return res.status(400).json({ message: "ID et quantité requis" });
    }

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "La quantité doit être supérieure à zéro" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [produitBruit] = await connection.query(
      `
      UPDATE RawProducts
      SET stock_quantity = stock_quantity + ?
      WHERE id = ?`,
      [quantity, id],
    );

    if (produitBruit.affectedRows === 0) {
      return res.status(404).json({ message: "Produit brut non trouvé" });
    }

    res.status(200).json({
      message: "Produit brut approvisionné avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'approvisionnement du produit brut:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'approvisionnement du produit brut" });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour désapprovisionner un produit brut
export const desapprovisionnerProduitBrut = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  let connection;
  try {
    if (!id || quantity === undefined) {
      return res.status(400).json({ message: "ID et quantité requis" });
    }

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "La quantité doit être supérieure à zéro" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    const [produit] = await connection.query(
      "SELECT stock_quantity FROM RawProducts WHERE id = ?",
      [id],
    );

    if (!produit || produit.length === 0) {
      return res.status(404).json({ message: "Produit brut non trouvé" });
    }

    if (produit[0].stock_quantity < quantity) {
      return res.status(400).json({
        message: "Stock insuffisant pour désapprovisionner cette quantité",
      });
    }

    const [produitBruit] = await connection.query(
      `
      UPDATE RawProducts
      SET stock_quantity = stock_quantity - ?
      WHERE id = ? AND stock_quantity >= ?`,
      [quantity, id, quantity],
    );

    if (produitBruit.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Produit brut non trouvé ou stock insuffisant pour désapprovisionner",
      });
    }

    res.status(200).json({
      message: "Produit brut désapprovisionné avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la désapprovisionnement du produit brut:",
      error,
    );
    res.status(500).json({
      message: "Erreur lors de la désapprovisionnement du produit brut",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour récupérer les unités de mesure disponibles
export const getUnitesMesure = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [unites] = await connection.query("SELECT id, code, nom FROM UnitesMesure");

    res.status(200).json({
      message: "Unités de mesure récupérées avec succès",
      data: unites,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des unités de mesure:",
      error,
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des unités de mesure" });
  } finally {
    if (connection) connection.release();
  }
};
