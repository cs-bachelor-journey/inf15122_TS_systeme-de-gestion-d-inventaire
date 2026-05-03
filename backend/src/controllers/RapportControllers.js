import { connectDatabase } from "../db/connectDatabase.js";

// Rapport des ventes par produit
export const RapportVentesParProduit = async (req, res) => {
  let connection;
  try {
    const { Debut, Datefin } = req.query;
    const db = await connectDatabase();
    connection = await db.getConnection();

    // Ventes par produit
    let query = `
      SELECT
        p.nom AS Produit,
        COALESCE(SUM(l.quantite), 0) AS Quantite_Vendue,
        ROUND(COALESCE(SUM(l.quantite * l.prix_unitaire), 0), 2) AS Produit_Ventes
      FROM ProduitTransform p
      LEFT JOIN FormatProduit fp ON fp.produit_id = p.id
      LEFT JOIN LignesCommandeTransforme l ON l.format_id = fp.id`;

    const params = [];
    if (Debut && Datefin) {
      query += ` LEFT JOIN CommandesProduitTransformer c ON l.commande_id = c.id
                WHERE c.created_at BETWEEN ? AND ?`;
      params.push(Debut, Datefin);
    }
    query += ` GROUP BY p.id ORDER BY Produit_Ventes DESC`;

    const [ventes] = await connection.query(query, params);

    // Ajouter coûts et profit
    for (const produit of ventes) {
      if (produit.Quantite_Vendue === 0) {
        produit.Cout_Production = 0;
        produit.Profit_Realise = 0;
        continue;
      }

      // Main d'œuvre
      const [mainDoeuvre] = await connection.query(
        `
        SELECT ROUND(SUM(pp.hourly_rate * pp.plan_duration * pp.quantite_plan), 2) AS cout
        FROM PlanProduction pp
        JOIN FormatProduit fp ON fp.id = pp.id_format
        JOIN ProduitTransform p ON p.id = fp.produit_id
        WHERE p.nom = ?
        ${Debut && Datefin ? `AND pp.date_plan BETWEEN ? AND ?` : ""}
      `,
        Debut && Datefin
          ? [produit.Produit, Debut, Datefin]
          : [produit.Produit],
      );

      // Matières premières: agréger les plans par format d'abord
      const [matieres] = await connection.query(
        `
        SELECT
          r.nom AS Produit_Brut,
          r.id AS raw_id,
          ROUND(SUM(prod.total_qte * rp.quantite_produit_brut / rp.quantite_produit_trans), 2) AS Quantite
        FROM (
          SELECT id_format, SUM(quantite_plan) AS total_qte
          FROM PlanProduction pp2
          JOIN FormatProduit fp2 ON fp2.id = pp2.id_format
          JOIN ProduitTransform p2 ON p2.id = fp2.produit_id
          WHERE p2.nom = ?
          ${Debut && Datefin ? `AND pp2.date_plan BETWEEN ? AND ?` : ""}
          GROUP BY id_format
        ) AS prod
        JOIN RecettesProduit rp ON rp.format_id = prod.id_format
        JOIN RawProducts r ON r.id = rp.raw_produit_id
        GROUP BY r.id
      `,
        Debut && Datefin
          ? [produit.Produit, Debut, Datefin]
          : [produit.Produit],
      );

      // Calculer le coût des matières
      let coutMatieres = 0;
      for (const m of matieres) {
        const [prixRow] = await connection.query(
          "SELECT prix_unitaire FROM PrixFournisseurQuantite WHERE rawproduct_id = ? ORDER BY quantite_min ASC LIMIT 1",
          [m.raw_id],
        );
        const prix = Number(prixRow[0]?.prix_unitaire) || 0;
        coutMatieres += Math.round(m.Quantite * prix * 100) / 100;
      }

      produit.Cout_Production =
        Math.round((coutMatieres + (mainDoeuvre[0]?.cout || 0)) * 100) / 100;
      produit.Profit_Realise =
        Math.round((produit.Produit_Ventes - produit.Cout_Production) * 100) /
        100;
    }

    res.status(200).json({
      message: "Rapport des ventes par produit",
      periode: Debut && Datefin ? { debut: Debut, fin: Datefin } : "Tout",
      data: ventes,
    });
  } catch (error) {
    console.error("Erreur rapport ventes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

// Évolution des ventes mensuelles
export const EvolutionVentesMensuelles = async (req, res) => {
  let connection;
  try {
    const { Debut, Datefin } = req.query;
    const db = await connectDatabase();
    connection = await db.getConnection();

    let query = `
      SELECT
        p.nom AS Produit,
        DATE_FORMAT(c.created_at, '%Y-%m') AS Mois,
        SUM(l.quantite) AS Quantite_Vendue,
        ROUND(SUM(l.quantite * l.prix_unitaire), 2) AS Produit_Ventes
      FROM LignesCommandeTransforme l
      JOIN FormatProduit fp ON l.format_id = fp.id
      JOIN ProduitTransform p ON p.id = fp.produit_id
      JOIN CommandesProduitTransformer c ON c.id = l.commande_id`;

    const params = [];
    if (Debut && Datefin) {
      query += ` WHERE c.created_at BETWEEN ? AND ?`;
      params.push(Debut, Datefin);
    }
    query += ` GROUP BY p.id, DATE_FORMAT(c.created_at, '%Y-%m')
              ORDER BY Mois DESC, Produit_Ventes DESC`;

    const [rapport] = await connection.query(query, params);
    res.status(200).json({
      message: "Évolution des ventes mensuelles",
      periode: Debut && Datefin ? { debut: Debut, fin: Datefin } : "Tout",
      data: rapport,
    });
  } catch (error) {
    console.error("Erreur évolution ventes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

// Rapport des coûts de production par produit
export const RapportCoutsProductionParProduit = async (req, res) => {
  let connection;
  try {
    const { Debut, Datefin } = req.query;
    const db = await connectDatabase();
    connection = await db.getConnection();

    // Récupérer les produits qui ont des plans
    const [produits] = await connection.query(
      `
      SELECT DISTINCT p.id, p.nom AS Produit
      FROM PlanProduction pp
      JOIN FormatProduit fp ON fp.id = pp.id_format
      JOIN ProduitTransform p ON p.id = fp.produit_id
      ${Debut && Datefin ? `WHERE pp.date_plan BETWEEN ? AND ?` : ""}
    `,
      Debut && Datefin ? [Debut, Datefin] : [],
    );

    const rapport = [];

    for (const produit of produits) {
      // Main d'œuvre
      const [mainDoeuvre] = await connection.query(
        `
        SELECT ROUND(SUM(pp.hourly_rate * pp.plan_duration * pp.quantite_plan), 2) AS Cout_Main_Oeuvre
        FROM PlanProduction pp
        JOIN FormatProduit fp ON fp.id = pp.id_format
        WHERE fp.produit_id = ?
        ${Debut && Datefin ? `AND pp.date_plan BETWEEN ? AND ?` : ""}
      `,
        Debut && Datefin ? [produit.id, Debut, Datefin] : [produit.id],
      );

      // Matières premières
      const [matieres] = await connection.query(
        `
        SELECT
          r.nom AS Produit_Brut,
          r.id AS raw_id,
          ROUND(SUM(prod.total_qte * rp.quantite_produit_brut / rp.quantite_produit_trans), 2) AS Quantite
        FROM (
          SELECT id_format, SUM(quantite_plan) AS total_qte
          FROM PlanProduction pp2
          JOIN FormatProduit fp2 ON fp2.id = pp2.id_format
          WHERE fp2.produit_id = ?
          ${Debut && Datefin ? `AND pp2.date_plan BETWEEN ? AND ?` : ""}
          GROUP BY id_format
        ) AS prod
        JOIN RecettesProduit rp ON rp.format_id = prod.id_format
        JOIN RawProducts r ON r.id = rp.raw_produit_id
        GROUP BY r.id
      `,
        Debut && Datefin ? [produit.id, Debut, Datefin] : [produit.id],
      );

      let coutMatieres = 0;
      const details = [];

      for (const m of matieres) {
        const [prixRow] = await connection.query(
          "SELECT prix_unitaire FROM PrixFournisseurQuantite WHERE rawproduct_id = ? ORDER BY quantite_min ASC LIMIT 1",
          [m.raw_id],
        );
        const prix = Number(prixRow[0]?.prix_unitaire) || 0;
        const cout = Math.round(m.Quantite * prix * 100) / 100;
        coutMatieres += cout;
        details.push({
          Produit_Brut: m.Produit_Brut,
          Quantite: m.Quantite,
          Prix_Unitaire: prix,
          Cout: cout,
        });
      }
      coutMatieres = Math.round(coutMatieres * 100) / 100;

      rapport.push({
        Produit: produit.Produit,
        Details_Matieres: details,
        Cout_Matieres_Premieres: coutMatieres,
        Cout_Main_Oeuvre: Number(mainDoeuvre[0]?.Cout_Main_Oeuvre) || 0,
        Cout_Total_Production:
          Math.round(
            (coutMatieres + (mainDoeuvre[0]?.Cout_Main_Oeuvre || 0)) * 100,
          ) / 100,
      });
    }

    res.status(200).json({
      message: "Rapport des coûts de production par produit",
      periode: Debut && Datefin ? { debut: Debut, fin: Datefin } : "Tout",
      data: rapport,
    });
  } catch (error) {
    console.error("Erreur coûts production:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

// Rapport de consommation des produits bruts
export const RapportConsommationProduitsBruts = async (req, res) => {
  let connection;
  try {
    const { Debut, Datefin } = req.query;
    const db = await connectDatabase();
    connection = await db.getConnection();

    let query = `
      SELECT
        r.nom AS Produit_Brut,
        ROUND(SUM(prod.total_qte * rp.quantite_produit_brut / rp.quantite_produit_trans), 2) AS Quantite_Utilisee
      FROM (
        SELECT id_format, SUM(quantite_plan) AS total_qte
        FROM PlanProduction pp`;

    const params = [];
    if (Debut && Datefin) {
      query += ` WHERE pp.date_plan BETWEEN ? AND ?`;
      params.push(Debut, Datefin);
    }
    query += ` GROUP BY id_format
      ) AS prod
      JOIN RecettesProduit rp ON rp.format_id = prod.id_format
      JOIN RawProducts r ON r.id = rp.raw_produit_id
      GROUP BY r.id
      ORDER BY Quantite_Utilisee DESC`;

    const [rapport] = await connection.query(query, params);
    res.status(200).json({
      message: "Rapport de consommation des produits bruts",
      periode: Debut && Datefin ? { debut: Debut, fin: Datefin } : "Tout",
      data: rapport,
    });
  } catch (error) {
    console.error("Erreur consommation:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

// Rapport de consommation mensuelle
export const RapportConsommationMensuelle = async (req, res) => {
  let connection;
  try {
    const { Debut, Datefin } = req.query;
    const db = await connectDatabase();
    connection = await db.getConnection();

    let query = `
      SELECT
        r.nom AS Produit_Brut,
        DATE_FORMAT(pp.date_plan, '%Y-%m') AS Mois,
        ROUND(SUM(pp.quantite_plan * rp.quantite_produit_brut / rp.quantite_produit_trans), 2) AS Quantite_Utilisee
      FROM PlanProduction pp
      JOIN RecettesProduit rp ON rp.format_id = pp.id_format
      JOIN RawProducts r ON r.id = rp.raw_produit_id`;

    const params = [];
    if (Debut && Datefin) {
      query += ` WHERE pp.date_plan BETWEEN ? AND ?`;
      params.push(Debut, Datefin);
    }
    query += ` GROUP BY r.id, DATE_FORMAT(pp.date_plan, '%Y-%m')
              ORDER BY Mois DESC, Quantite_Utilisee DESC`;

    const [rapport] = await connection.query(query, params);
    res.status(200).json({
      message: "Rapport de consommation mensuelle",
      periode: Debut && Datefin ? { debut: Debut, fin: Datefin } : "Tout",
      data: rapport,
    });
  } catch (error) {
    console.error("Erreur consommation mensuelle:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};

// Moyenne de consommation par période
export const MoyenneConsommationParPeriode = async (req, res) => {
  let connection;
  try {
    const { Debut, Datefin } = req.query;
    if (!Debut || !Datefin) {
      return res
        .status(400)
        .json({ message: "Dates Debut et Datefin requises" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [rapport] = await connection.query(
      `SELECT
        r.nom AS Produit_Brut,
        ROUND(AVG(quantite_utilisee), 2) AS Moyenne_Consommation
      FROM (
        SELECT
          rp.raw_produit_id,
          SUM(pp.quantite_plan * rp.quantite_produit_brut / rp.quantite_produit_trans) AS quantite_utilisee
        FROM PlanProduction pp
        JOIN RecettesProduit rp ON rp.format_id = pp.id_format
        WHERE pp.date_plan BETWEEN ? AND ?
        GROUP BY rp.raw_produit_id, DATE_FORMAT(pp.date_plan, '%Y-%m')
      ) AS mensuel
      JOIN RawProducts r ON r.id = mensuel.raw_produit_id
      GROUP BY r.id
      ORDER BY Moyenne_Consommation DESC`,
      [Debut, Datefin],
    );

    res.status(200).json({
      message: "Moyenne de consommation par période",
      periode: { debut: Debut, fin: Datefin },
      data: rapport,
    });
  } catch (error) {
    console.error("Erreur moyenne consommation:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    if (connection) connection.release();
  }
};
