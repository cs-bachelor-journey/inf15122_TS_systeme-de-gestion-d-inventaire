import { connectDatabase } from "../db/connectDatabase.js";

export const getRecettes = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [recettes] = await connection.query(`
      SELECT
        fp.id AS format_id,
        pt.id AS produit_id,
        pt.nom AS produit_nom,
        fp.nom_format,
        um.code AS unite_code,
        COUNT(rp.raw_produit_id) AS nb_ingredients
      FROM FormatProduit fp
      JOIN ProduitTransform pt ON pt.id = fp.produit_id
      JOIN UnitesMesure um ON um.id = fp.unite_id
      LEFT JOIN RecettesProduit rp ON rp.format_id = fp.id
      GROUP BY fp.id, pt.id, pt.nom, fp.nom_format, um.code
      ORDER BY pt.nom, fp.nom_format
    `);

    res.status(200).json({
      message: "Recettes récupérées avec succès",
      data: recettes,
    });
  } catch (error) {
    console.error("Erreur lors de la consultation des recettes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const getRecetteById = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [formatRows] = await connection.query(
      `SELECT
        fp.id AS format_id,
        pt.id AS produit_id,
        pt.nom AS produit_nom,
        fp.nom_format,
        fp.stock_quantity,
        um.code AS unite_code
      FROM FormatProduit fp
      JOIN ProduitTransform pt ON pt.id = fp.produit_id
      JOIN UnitesMesure um ON um.id = fp.unite_id
      WHERE fp.id = ?`,
      [numericId],
    );

    if (!formatRows || formatRows.length === 0) {
      return res.status(404).json({ message: "Recette non trouvée" });
    }

    const format = formatRows[0];

    const [ingredients] = await connection.query(
      `SELECT
        rp.raw_produit_id,
        r.nom AS produit_brut_nom,
        um.code AS unite_code,
        um.nom AS unite_nom,
        rp.quantite_produit_trans,
        rp.quantite_produit_brut,
        r.stock_quantity AS stock_disponible,
        r.stock_quantity >= rp.quantite_produit_brut AS stock_suffisant
      FROM RecettesProduit rp
      JOIN RawProducts r ON r.id = rp.raw_produit_id
      JOIN UnitesMesure um ON um.id = r.unite_id
      WHERE rp.format_id = ?
      ORDER BY r.nom`,
      [numericId],
    );

    const [prix] = await connection.query(
      `SELECT id, client_type, quantite_min, prix
       FROM PrixProduitTransforme
       WHERE format_id = ?
       ORDER BY client_type, quantite_min`,
      [numericId],
    );

    res.status(200).json({
      message: "Recette récupérée avec succès",
      data: { ...format, ingredients, prix },
    });
  } catch (error) {
    console.error("Erreur lors de la consultation de la recette:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const creerRecette = async (req, res) => {
  const { format_id, ingredients } = req.body;
  let connection;

  try {
    if (!format_id || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: "format_id et au moins un ingrédient sont requis" });
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

    for (const ing of ingredients) {
      if (!ing.raw_produit_id || ing.quantite_produit_trans === undefined || ing.quantite_produit_brut === undefined) {
        return res.status(400).json({ message: "Chaque ingrédient doit avoir raw_produit_id, quantite_produit_trans et quantite_produit_brut" });
      }

      const [rawProd] = await connection.query(
        `SELECT id FROM RawProducts WHERE id = ?`,
        [ing.raw_produit_id],
      );
      if (!rawProd || rawProd.length === 0) {
        return res.status(404).json({ message: `Produit brut ID ${ing.raw_produit_id} non trouvé` });
      }

      await connection.query(
        `INSERT INTO RecettesProduit (format_id, raw_produit_id, quantite_produit_trans, quantite_produit_brut)
         VALUES (?, ?, ?, ?)`,
        [format_id, ing.raw_produit_id, ing.quantite_produit_trans, ing.quantite_produit_brut],
      );
    }

    res.status(201).json({ message: "Recette créée avec succès" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Un ingrédient existe déjà dans cette recette" });
    }
    console.error("Erreur lors de la création de la recette:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const modifierRecette = async (req, res) => {
  const { id } = req.params;
  const { ingredients } = req.body;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [format] = await connection.query(
      `SELECT id FROM FormatProduit WHERE id = ?`,
      [numericId],
    );
    if (!format || format.length === 0) {
      return res.status(404).json({ message: "Format non trouvé" });
    }

    if (ingredients && Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        if (!ing.raw_produit_id || ing.quantite_produit_trans === undefined || ing.quantite_produit_brut === undefined) {
          return res.status(400).json({ message: "Chaque ingrédient doit avoir raw_produit_id, quantite_produit_trans et quantite_produit_brut" });
        }

        await connection.query(
          `INSERT INTO RecettesProduit (format_id, raw_produit_id, quantite_produit_trans, quantite_produit_brut)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             quantite_produit_trans = VALUES(quantite_produit_trans),
             quantite_produit_brut = VALUES(quantite_produit_brut)`,
          [numericId, ing.raw_produit_id, ing.quantite_produit_trans, ing.quantite_produit_brut],
        );
      }
    }

    res.status(200).json({ message: "Recette modifiée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la modification de la recette:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const supprimerRecette = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [format] = await connection.query(
      `SELECT id FROM FormatProduit WHERE id = ?`,
      [numericId],
    );
    if (!format || format.length === 0) {
      return res.status(404).json({ message: "Format non trouvé" });
    }

    await connection.query(`DELETE FROM RecettesProduit WHERE format_id = ?`, [numericId]);

    res.status(200).json({ message: "Recette supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la recette:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const ajouterMatiere = async (req, res) => {
  const { id } = req.params;
  const { raw_produit_id, quantite_produit_trans, quantite_produit_brut } = req.body;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID invalide" });
    }

    if (!raw_produit_id || quantite_produit_trans === undefined || quantite_produit_brut === undefined) {
      return res.status(400).json({ message: "raw_produit_id, quantite_produit_trans et quantite_produit_brut sont requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [format] = await connection.query(
      `SELECT id FROM FormatProduit WHERE id = ?`,
      [numericId],
    );
    if (!format || format.length === 0) {
      return res.status(404).json({ message: "Format non trouvé" });
    }

    const [rawProd] = await connection.query(
      `SELECT id FROM RawProducts WHERE id = ?`,
      [raw_produit_id],
    );
    if (!rawProd || rawProd.length === 0) {
      return res.status(404).json({ message: "Produit brut non trouvé" });
    }

    await connection.query(
      `INSERT INTO RecettesProduit (format_id, raw_produit_id, quantite_produit_trans, quantite_produit_brut)
       VALUES (?, ?, ?, ?)`,
      [numericId, raw_produit_id, quantite_produit_trans, quantite_produit_brut],
    );

    res.status(201).json({ message: "Matière première ajoutée à la recette avec succès" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Cette matière première est déjà dans la recette" });
    }
    console.error("Erreur lors de l'ajout de la matière première:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const modifierMatiere = async (req, res) => {
  const { id, matiereId } = req.params;
  const { quantite_produit_trans, quantite_produit_brut } = req.body;
  let connection;

  try {
    const numericFormatId = Number(id);
    const numericMatiereId = Number(matiereId);
    if (isNaN(numericFormatId) || isNaN(numericMatiereId)) {
      return res.status(400).json({ message: "IDs invalides" });
    }

    if (quantite_produit_trans === undefined && quantite_produit_brut === undefined) {
      return res.status(400).json({ message: "Au moins une quantité est requise" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [existing] = await connection.query(
      `SELECT * FROM RecettesProduit WHERE format_id = ? AND raw_produit_id = ?`,
      [numericFormatId, numericMatiereId],
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Matière première non trouvée dans cette recette" });
    }

    const current = existing[0];

    await connection.query(
      `UPDATE RecettesProduit SET quantite_produit_trans = ?, quantite_produit_brut = ?
       WHERE format_id = ? AND raw_produit_id = ?`,
      [
        quantite_produit_trans !== undefined ? quantite_produit_trans : current.quantite_produit_trans,
        quantite_produit_brut !== undefined ? quantite_produit_brut : current.quantite_produit_brut,
        numericFormatId,
        numericMatiereId,
      ],
    );

    res.status(200).json({ message: "Matière première modifiée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la modification de la matière première:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const supprimerMatiere = async (req, res) => {
  const { id, matiereId } = req.params;
  let connection;

  try {
    const numericFormatId = Number(id);
    const numericMatiereId = Number(matiereId);
    if (isNaN(numericFormatId) || isNaN(numericMatiereId)) {
      return res.status(400).json({ message: "IDs invalides" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [result] = await connection.query(
      `DELETE FROM RecettesProduit WHERE format_id = ? AND raw_produit_id = ?`,
      [numericFormatId, numericMatiereId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Matière première non trouvée dans cette recette" });
    }

    res.status(200).json({ message: "Matière première retirée de la recette avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la matière première:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const getMatieresNecessaires = async (req, res) => {
  const { id } = req.params;
  const { quantite = 1 } = req.query;
  let connection;

  try {
    const numericId = Number(id);
    const targetQty = Number(quantite);
    if (isNaN(numericId) || isNaN(targetQty) || targetQty <= 0) {
      return res.status(400).json({ message: "ID et quantite invalides" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [format] = await connection.query(
      `SELECT
        fp.id,
        pt.nom AS produit_nom,
        fp.nom_format,
        um.code AS unite_code
      FROM FormatProduit fp
      JOIN ProduitTransform pt ON pt.id = fp.produit_id
      JOIN UnitesMesure um ON um.id = fp.unite_id
      WHERE fp.id = ?`,
      [numericId],
    );

    if (!format || format.length === 0) {
      return res.status(404).json({ message: "Format non trouvé" });
    }

    const [ingredients] = await connection.query(
      `SELECT
        rp.raw_produit_id,
        r.nom AS produit_brut_nom,
        um.code AS unite_code,
        rp.quantite_produit_brut,
        rp.quantite_produit_trans,
        r.stock_quantity AS stock_disponible
      FROM RecettesProduit rp
      JOIN RawProducts r ON r.id = rp.raw_produit_id
      JOIN UnitesMesure um ON um.id = r.unite_id
      WHERE rp.format_id = ?`,
      [numericId],
    );

    if (ingredients.length === 0) {
      return res.status(404).json({ message: "Aucune recette définie pour ce format" });
    }

    const matieres = ingredients.map((ing) => {
      const ratio = targetQty / ing.quantite_produit_trans;
      const besoin = ing.quantite_produit_brut * ratio;
      const manque = Math.max(0, besoin - ing.stock_disponible);
      return {
        produit_brut_id: ing.raw_produit_id,
        produit_brut_nom: ing.produit_brut_nom,
        unite: ing.unite_code,
        quantite_par_unite: ing.quantite_produit_brut,
        stock_disponible: ing.stock_disponible,
        quantite_necessaire: Math.round(besoin * 100) / 100,
        quantite_manquante: Math.round(manque * 100) / 100,
        suffisant: manque === 0,
      };
    });

    res.status(200).json({
      message: "Calcul des matières nécessaires",
      data: {
        format_id: format[0].id,
        produit_nom: format[0].produit_nom,
        nom_format: format[0].nom_format,
        quantite_demandee: targetQty,
        matieres_necessaires: matieres,
        tout_disponible: matieres.every((m) => m.suffisant),
      },
    });
  } catch (error) {
    console.error("Erreur lors du calcul des matières nécessaires:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

export const validerRecette = async (req, res) => {
  const { id } = req.params;
  const { quantite = 1 } = req.body;
  let connection;

  try {
    const numericId = Number(id);
    const targetQty = Number(quantite);
    if (isNaN(numericId) || isNaN(targetQty) || targetQty <= 0) {
      return res.status(400).json({ message: "ID et quantite invalides" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [format] = await connection.query(
      `SELECT
        fp.id,
        pt.nom AS produit_nom,
        fp.nom_format
      FROM FormatProduit fp
      JOIN ProduitTransform pt ON pt.id = fp.produit_id
      WHERE fp.id = ?`,
      [numericId],
    );

    if (!format || format.length === 0) {
      return res.status(404).json({ message: "Format non trouvé" });
    }

    const [ingredients] = await connection.query(
      `SELECT
        rp.raw_produit_id,
        r.nom AS produit_brut_nom,
        rp.quantite_produit_brut,
        rp.quantite_produit_trans,
        r.stock_quantity AS stock_disponible
      FROM RecettesProduit rp
      JOIN RawProducts r ON r.id = rp.raw_produit_id
      WHERE rp.format_id = ?`,
      [numericId],
    );

    if (ingredients.length === 0) {
      return res.status(400).json({
        message: "Recette invalide: aucun ingrédient défini",
        data: { valide: false, format: format[0], ingredients: [] },
      });
    }

    const resultats = ingredients.map((ing) => {
      const ratio = targetQty / ing.quantite_produit_trans;
      const besoin = ing.quantite_produit_brut * ratio;
      const manque = Math.max(0, besoin - ing.stock_disponible);
      return {
        produit_brut_id: ing.raw_produit_id,
        produit_brut_nom: ing.produit_brut_nom,
        stock_disponible: ing.stock_disponible,
        quantite_necessaire: Math.round(besoin * 100) / 100,
        quantite_manquante: Math.round(manque * 100) / 100,
        suffisant: manque === 0,
      };
    });

    const valide = resultats.every((r) => r.suffisant);

    res.status(200).json({
      message: valide ? "Recette validée: toutes les matières sont disponibles" : "Recette non valide: matières manquantes",
      data: {
        valide,
        format: format[0],
        quantite_demandee: targetQty,
        resultats,
        nb_manquants: resultats.filter((r) => !r.suffisant).length,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la validation de la recette:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};
