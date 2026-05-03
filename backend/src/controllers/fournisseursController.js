import { connectDatabase } from "../db/connectDatabase.js";

// Contrôleur pour les fournisseurs
export const consulterFournisseurs = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();

    const [fournisseurs] = await connection.query(`
        SELECT id, name, tel, email, web_site, person_to_contact
        FROM Suppliers
        ORDER BY name
    `);

    res.status(200).json({
      message: "Fournisseurs récupérés avec succès",
      data: fournisseurs,
    });
  } catch (error) {
    console.error("Erreur lors de la consultation des fournisseurs:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la consultation des fournisseurs" });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour ajouter un nouveau fournisseur
export const ajouterFournisseur = async (req, res) => {
  const { name, tel, email, web_site, person_to_contact } = req.body;
  let connection;

  try {
    if (!name || !tel || !email || !web_site || !person_to_contact) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    await connection.query(
      `INSERT INTO Suppliers (name, tel, email, web_site, person_to_contact)
        VALUES (?, ?, ?, ?, ?)
        `,
      [name, tel, email, web_site, person_to_contact],
    );

    res.status(201).json({
      message: "Fournisseur ajouté avec succès",
      data: { name, tel, email, web_site, person_to_contact },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du fournisseur:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du fournisseur" });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour consulter un fournisseur par ID avec ses produits bruts associés
export const consulterFournisseurParId = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    if (!id) {
      return res.status(400).json({ message: "ID du fournisseur requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    const [fournisseur] = await connection.query(
      `SELECT id, name, tel, email, web_site, person_to_contact
       FROM Suppliers
       WHERE id = ?`,
      [id],
    );

    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    // Récupérer les produits bruts associés à ce fournisseur
    const [produitsBruts] = await connection.query(
      `SELECT 
          rp.id AS produit_id,
          rp.nom AS produit_nom,
          um.nom AS unite_nom,
          pfq.quantite_min,
          pfq.prix_unitaire
      FROM RawProductsSuppliers rps
      JOIN RawProducts rp ON rp.id = rps.rawproduct_id
      JOIN UnitesMesure um ON um.id = rp.unite_id
      JOIN Suppliers s ON s.id = rps.supplier_id
      LEFT JOIN PrixFournisseurQuantite pfq 
          ON pfq.supplier_id = rps.supplier_id 
          AND pfq.rawproduct_id = rps.rawproduct_id
      WHERE s.id = ?
      ORDER BY rp.nom, pfq.quantite_min`,
      [id],
    );

    const count = produitsBruts.length;
    res.status(200).json({
      message: "Fournisseur récupéré avec succès",
      data: { ...fournisseur, produitsBruts, totalProduitsBruts: count },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la consultation du fournisseur par ID:",
      error,
    );
    res.status(500).json({
      message: "Erreur lors de la consultation du fournisseur par ID",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour supprimer un fournisseur par ID
export const supprimerFournisseur = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    if (!id) {
      return res.status(400).json({ message: "ID du fournisseur requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [fournisseur] = await connection.query(
      `SELECT id FROM Suppliers WHERE id = ?`,
      [id],
    );

    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    await connection.query(`DELETE FROM Suppliers WHERE id = ?`, [id]);
    res.status(200).json({ message: "Fournisseur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du fournisseur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du fournisseur" });
  } finally {
    if (connection) connection.release();
  }
};

// Contrôleur pour mettre à jour un fournisseur par ID
export const mettreAJourFournisseur = async (req, res) => {
  const { id } = req.params;
  const { name, tel, email, web_site, person_to_contact } = req.body;
  let connection;

  try {
    if (!id) {
      return res.status(400).json({ message: "ID du fournisseur requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [existing] = await connection.query(`SELECT * FROM Suppliers WHERE id = ?`, [
      id,
    ]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    const fournisseur = existing[0];

    await connection.query(
      `UPDATE Suppliers
       SET name = ?, tel = ?, email = ?, web_site = ?, person_to_contact = ?
       WHERE id = ?`,
      [
        name ?? fournisseur.name,
        tel ?? fournisseur.tel,
        email ?? fournisseur.email,
        web_site ?? fournisseur.web_site,
        person_to_contact ?? fournisseur.person_to_contact,
        id,
      ],
    );

    res.status(200).json({ message: "Fournisseur mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du fournisseur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du fournisseur" });
  } finally {
    if (connection) connection.release();
  }
};

// Association entre les fournisseurs et les produits bruts
export const associerFournisseurProduitBrut = async (req, res) => {
  const { supplierId, rawProductId } = req.params;
  let connection;

  try {
    if (!supplierId || !rawProductId) {
      return res
        .status(400)
        .json({ message: "ID du fournisseur et ID du produit brut requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    // Vérifier si le fournisseur existe
    const [fournisseur] = await connection.query(
      `SELECT id FROM Suppliers WHERE id = ?`,
      [supplierId],
    );
    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    // Vérifier si le produit brut existe
    const [produitBrut] = await connection.query(
      `SELECT id FROM RawProducts WHERE id = ?`,
      [rawProductId],
    );
    if (!produitBrut) {
      return res.status(404).json({ message: "Produit brut non trouvé" });
    }

    // Vérifier si l'association existe déjà
    const [association] = await connection.query(
      `SELECT * FROM RawProductsSuppliers WHERE supplier_id = ? AND rawproduct_id = ?`,
      [supplierId, rawProductId],
    );
    if (association.length > 0) {
      return res
        .status(400)
        .json({ message: "Le fournisseur est déjà associé à ce produit brut" });
    }

    // Créer l'association
    await connection.query(
      `INSERT INTO RawProductsSuppliers (supplier_id, rawproduct_id) VALUES (?, ?)`,
      [supplierId, rawProductId],
    );

    res
      .status(201)
      .json({ message: "Fournisseur associé au produit brut avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de l'association du fournisseur au produit brut:",
      error,
    );
    res.status(500).json({
      message: "Erreur lors de l'association du fournisseur au produit brut",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Creer un prix pour un fournisseur et un produit brut
export const creerPrixFournisseurQuantite = async (req, res) => {
  const { supplierId, rawProductId } = req.params;
  const { quantite_min, prix_unitaire } = req.body;
  let connection;
  try {
    if (!supplierId || !rawProductId) {
      return res
        .status(400)
        .json({ message: "ID du fournisseur et ID du produit brut requis" });
    }
    if (quantite_min === undefined || prix_unitaire === undefined) {
      return res
        .status(400)
        .json({ message: "Quantité minimale et prix unitaire requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    // Vérifier si le fournisseur existe
    const [fournisseur] = await connection.query(
      `SELECT id FROM Suppliers WHERE id = ?`,
      [supplierId],
    );
    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    // Vérifier si le produit brut existe
    const [produitBrut] = await connection.query(
      `SELECT id FROM RawProducts WHERE id = ?`,
      [rawProductId],
    );
    if (!produitBrut) {
      return res.status(404).json({ message: "Produit brut non trouvé" });
    }

    // Vérifier si une association existe entre le fournisseur et le produit brut
    const [association] = await connection.query(
      `SELECT * FROM RawProductsSuppliers WHERE supplier_id = ? AND rawproduct_id = ?`,
      [supplierId, rawProductId],
    );

    if (association.length === 0) {
      return res.status(400).json({
        message:
          "Le fournisseur doit être associé au produit brut avant de définir un prix",
      });
    }

    // Créer ou mettre à jour le prix pour ce fournisseur et ce produit brut
    await connection.query(
      `INSERT INTO PrixFournisseurQuantite (supplier_id, rawproduct_id, quantite_min, prix_unitaire)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantite_min = VALUES(quantite_min), prix_unitaire = VALUES(prix_unitaire)`,
      [supplierId, rawProductId, quantite_min, prix_unitaire],
    );

    res.status(201).json({
      message:
        "Prix pour le fournisseur et le produit brut créé/mis à jour avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création du prix pour le fournisseur et le produit brut:",
      error,
    );
    res.status(500).json({
      message:
        "Erreur lors de la création du prix pour le fournisseur et le produit brut",
    });
  } finally {
    if (connection) connection.release();
  }
};
