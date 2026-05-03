import { connectDatabase } from "../db/connectDatabase.js";

// controller pour les plans de production et calculs associés
export const getAllPlans = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT
        pp.id,
        pp.id_format,
        fp.nom_format,
        pt.id   AS produit_id,
        pt.nom  AS produit_nom,
        um.code AS unite_code,
        pp.quantite_plan,
        pp.date_plan,
        pp.plan_duration,
        pp.real_duration,
        pp.hourly_rate
      FROM PlanProduction pp
      JOIN FormatProduit    fp ON fp.id = pp.id_format
      JOIN ProduitTransform pt ON pt.id = fp.produit_id
      JOIN UnitesMesure     um ON um.id = fp.unite_id
      ORDER BY pp.date_plan ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour recuperer un plan de production par son id, avec détails format/produit
export const getPlanById = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [[plan]] = await connection.query(
      `
      SELECT
        pp.id,
        pp.id_format,
        fp.nom_format,
        pt.id   AS produit_id,
        pt.nom  AS produit_nom,
        um.code AS unite_code,
        pp.quantite_plan,
        pp.date_plan,
        pp.plan_duration,
        pp.real_duration,
        pp.hourly_rate
      FROM PlanProduction pp
      JOIN FormatProduit    fp ON fp.id = pp.id_format
      JOIN ProduitTransform pt ON pt.id = fp.produit_id
      JOIN UnitesMesure     um ON um.id = fp.unite_id
      WHERE pp.id = ?
    `,
      [id],
    );

    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan introuvable" });
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour créer un plan de production
export const createPlan = async (req, res) => {
  const {
    id_format,
    quantite_plan,
    date_plan,
    plan_duration,
    real_duration,
    hourly_rate,
  } = req.body;
  let connection;

  if (!id_format || !quantite_plan || !date_plan || !plan_duration) {
    return res.status(400).json({
      success: false,
      message:
        "Champs obligatoires: id_format, quantite_plan, date_plan, plan_duration",
    });
  }

  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [[format]] = await connection.query(
      "SELECT id FROM FormatProduit WHERE id = ?",
      [id_format],
    );
    if (!format)
      return res
        .status(404)
        .json({ success: false, message: "FormatProduit introuvable" });

    const [result] = await connection.query(
      `
      INSERT INTO PlanProduction (id_format, quantite_plan, date_plan, plan_duration, real_duration, hourly_rate)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        id_format,
        quantite_plan,
        date_plan,
        plan_duration,
        real_duration ?? null,
        hourly_rate ?? 20.0,
      ],
    );

    const [[newPlan]] = await connection.query(
      "SELECT * FROM PlanProduction WHERE id = ?",
      [result.insertId],
    );
    res
      .status(201)
      .json({ success: true, message: "Plan créé avec succès", data: newPlan });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour mettre à jour un plan de production
export const updatePlan = async (req, res) => {
  const { id } = req.params;
  const {
    id_format,
    quantite_plan,
    date_plan,
    plan_duration,
    real_duration,
    hourly_rate,
  } = req.body;
  let connection;

  if (!id_format || !quantite_plan || !date_plan || !plan_duration) {
    return res.status(400).json({
      success: false,
      message:
        "Champs obligatoires: id_format, quantite_plan, date_plan, plan_duration",
    });
  }

  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [[existing]] = await connection.query(
      "SELECT id FROM PlanProduction WHERE id = ?",
      [id],
    );
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Plan introuvable" });

    await connection.query(
      `
      UPDATE PlanProduction
      SET id_format=?, quantite_plan=?, date_plan=?, plan_duration=?, real_duration=?, hourly_rate=?
      WHERE id = ?
    `,
      [
        id_format,
        quantite_plan,
        date_plan,
        plan_duration,
        real_duration ?? null,
        hourly_rate ?? 20.0,
        id,
      ],
    );

    const [[updated]] = await connection.query(
      "SELECT * FROM PlanProduction WHERE id = ?",
      [id],
    );
    res.json({ success: true, message: "Plan mis à jour", data: updated });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour supprimer un plan de production
export const deletePlan = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [[existing]] = await connection.query(
      "SELECT id FROM PlanProduction WHERE id = ?",
      [id],
    );
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Plan introuvable" });
    await connection.query("DELETE FROM PlanProduction WHERE id = ?", [id]);
    res.json({ success: true, message: "Plan supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour mettre à jour la durée planifiée d'un plan de production
export const updateDureePlanifiee = async (req, res) => {
  const { id } = req.params;
  const { plan_duration } = req.body;
  let connection;
  if (
    plan_duration == null ||
    isNaN(plan_duration) ||
    Number(plan_duration) < 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "plan_duration invalide ou manquant" });
  }
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [[existing]] = await connection.query(
      "SELECT id FROM PlanProduction WHERE id = ?",
      [id],
    );
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Plan introuvable" });
    await connection.query("UPDATE PlanProduction SET plan_duration = ? WHERE id = ?", [
      plan_duration,
      id,
    ]);
    const [[updated]] = await connection.query(
      "SELECT * FROM PlanProduction WHERE id = ?",
      [id],
    );
    res.json({
      success: true,
      message: "Durée planifiée mise à jour",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour mettre à jour la durée réelle d'un plan de production
export const updateDureeReelle = async (req, res) => {
  const { id } = req.params;
  const { real_duration } = req.body;
  let connection;
  if (
    real_duration == null ||
    isNaN(real_duration) ||
    Number(real_duration) < 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "real_duration invalide ou manquant" });
  }
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [[existing]] = await connection.query(
      "SELECT id FROM PlanProduction WHERE id = ?",
      [id],
    );
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Plan introuvable" });
    await connection.query("UPDATE PlanProduction SET real_duration = ? WHERE id = ?", [
      real_duration,
      id,
    ]);
    const [[updated]] = await connection.query(
      "SELECT * FROM PlanProduction WHERE id = ?",
      [id],
    );
    res.json({
      success: true,
      message: "Durée réelle mise à jour",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour mettre à jour le taux horaire d'un plan de production
export const updateTauxHoraire = async (req, res) => {
  const { id } = req.params;
  const { hourly_rate } = req.body;
  let connection;
  if (hourly_rate == null || isNaN(hourly_rate) || Number(hourly_rate) < 0) {
    return res
      .status(400)
      .json({ success: false, message: "hourly_rate invalide ou manquant" });
  }
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [[existing]] = await connection.query(
      "SELECT id FROM PlanProduction WHERE id = ?",
      [id],
    );
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Plan introuvable" });
    await connection.query("UPDATE PlanProduction SET hourly_rate = ? WHERE id = ?", [
      hourly_rate,
      id,
    ]);
    const [[updated]] = await connection.query(
      "SELECT * FROM PlanProduction WHERE id = ?",
      [id],
    );
    res.json({
      success: true,
      message: "Taux horaire mis à jour",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour calculer les matières nécessaires à un plan de production, avec comparaison stock
/**
 * Formula:
 *   besoin = (quantite_plan / quantite_produit_trans) × quantite_produit_brut
 */
export const getMatiereNecessaires = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [[plan]] = await connection.query(
      "SELECT id, id_format, quantite_plan FROM PlanProduction WHERE id = ?",
      [id],
    );
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan introuvable" });

    const [recette] = await connection.query(
      `
      SELECT
        rp.raw_produit_id,
        raw.nom                   AS produit_brut_nom,
        um.code                   AS unite_code,
        raw.stock_quantity        AS stock_disponible,
        rp.quantite_produit_brut  AS qte_brut_par_lot,
        rp.quantite_produit_trans AS qte_produit_par_lot
      FROM RecettesProduit rp
      JOIN RawProducts  raw ON raw.id = rp.raw_produit_id
      JOIN UnitesMesure um  ON um.id  = raw.unite_id
      WHERE rp.format_id = ?
    `,
      [plan.id_format],
    );

    if (recette.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucune recette trouvée pour ce format",
      });
    }

    const matieres = recette.map((r) => {
      const facteur = plan.quantite_plan / r.qte_produit_par_lot;
      const qte_necessaire = r.qte_brut_par_lot * facteur;
      const manque = Math.max(0, qte_necessaire - r.stock_disponible);
      return {
        produit_brut_id: r.raw_produit_id,
        produit_brut_nom: r.produit_brut_nom,
        unite: r.unite_code,
        stock_disponible: r.stock_disponible,
        quantite_necessaire: Math.round(qte_necessaire * 100) / 100,
        quantite_manquante: Math.round(manque * 100) / 100,
        suffisant: manque === 0,
      };
    });

    res.json({
      success: true,
      data: {
        plan_id: plan.id,
        id_format: plan.id_format,
        quantite_plan: plan.quantite_plan,
        matieres_necessaires: matieres,
        tout_disponible: matieres.every((m) => m.suffisant),
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour calculer la durée de production d'un plan, avec coût et écart
export const getDureeProduction = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [[plan]] = await connection.query(
      `
      SELECT
        pp.id, pp.quantite_plan,
        pp.plan_duration, pp.real_duration, pp.hourly_rate,
        fp.nom_format,
        pt.nom AS produit_nom
      FROM PlanProduction pp
      JOIN FormatProduit    fp ON fp.id = pp.id_format
      JOIN ProduitTransform pt ON pt.id = fp.produit_id
      WHERE pp.id = ?
    `,
      [id],
    );

    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan introuvable" });

    const duree = plan.real_duration ?? plan.plan_duration ?? 0;
    const cout = Math.round(duree * (plan.hourly_rate ?? 0) * 100) / 100;
    const ecart =
      plan.real_duration !== null && plan.plan_duration !== null
        ? Math.round((plan.real_duration - plan.plan_duration) * 100) / 100
        : null;

    res.json({
      success: true,
      data: {
        plan_id: plan.id,
        produit_nom: plan.produit_nom,
        nom_format: plan.nom_format,
        quantite_plan: plan.quantite_plan,
        plan_duration: plan.plan_duration,
        real_duration: plan.real_duration,
        hourly_rate: plan.hourly_rate,
        cout_main_oeuvre: cout,
        ecart_heures: ecart,
        base_calcul:
          plan.real_duration !== null ? "durée réelle" : "durée planifiée",
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour comparer les besoins totaux en matières premières de tous les plans de production d'une période donnée, avec stock disponible et en commande
export const getComparaisonStock = async (req, res) => {
  const { date_debut, date_fin } = req.query;
  let connection;

  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    let dateFilter = "";
    const params = [];
    if (date_debut) {
      dateFilter += " AND pp.date_plan >= ?";
      params.push(date_debut);
    }
    if (date_fin) {
      dateFilter += " AND pp.date_plan <= ?";
      params.push(date_fin + " 23:59:59");
    }

    const [plans] = await connection.query(
      `SELECT id, id_format, quantite_plan FROM PlanProduction pp WHERE 1=1 ${dateFilter}`,
      params,
    );

    if (plans.length === 0) {
      return res.json({
        success: true,
        message: "Aucun plan trouvé dans cette période",
        data: { plans_total: 0, besoins: [] },
      });
    }

    // Calcul des besoins totaux par matière première pour tous les plans
    const besoinsMap = {};
    for (const plan of plans) {
      const [recette] = await connection.query(
        `
        SELECT
          rp.raw_produit_id,
          raw.nom                   AS produit_brut_nom,
          um.code                   AS unite_code,
          raw.stock_quantity        AS stock_disponible,
          rp.quantite_produit_brut  AS qte_brut_par_lot,
          rp.quantite_produit_trans AS qte_produit_par_lot
        FROM RecettesProduit rp
        JOIN RawProducts  raw ON raw.id = rp.raw_produit_id
        JOIN UnitesMesure um  ON um.id  = raw.unite_id
        WHERE rp.format_id = ?
      `,
        [plan.id_format],
      );

      for (const r of recette) {
        const facteur = plan.quantite_plan / r.qte_produit_par_lot;
        const qte = r.qte_brut_par_lot * facteur;
        if (!besoinsMap[r.raw_produit_id]) {
          besoinsMap[r.raw_produit_id] = {
            produit_brut_id: r.raw_produit_id,
            produit_brut_nom: r.produit_brut_nom,
            unite: r.unite_code,
            stock_disponible: r.stock_disponible,
            quantite_necessaire_totale: 0,
          };
        }
        besoinsMap[r.raw_produit_id].quantite_necessaire_totale += qte;
      }
    }

    // Quantities on order
    const [commandesEnCours] = await connection.query(`
      SELECT id_produit, SUM(quantite) AS en_commande
      FROM CommandesProduitBrut
      WHERE status IN ('commander', 'expedie')
      GROUP BY id_produit
    `);
    const commandesMap = {};
    commandesEnCours.forEach((c) => {
      commandesMap[c.id_produit] = Number(c.en_commande);
    });

    const besoins = Object.values(besoinsMap).map((b) => {
      const qte_totale = Math.round(b.quantite_necessaire_totale * 100) / 100;
      const en_commande = commandesMap[b.produit_brut_id] || 0;
      const disponible = b.stock_disponible + en_commande;
      const manque = Math.max(0, qte_totale - disponible);
      return {
        produit_brut_id: b.produit_brut_id,
        produit_brut_nom: b.produit_brut_nom,
        unite: b.unite,
        stock_disponible: b.stock_disponible,
        quantite_en_commande: en_commande,
        total_disponible: Math.round(disponible * 100) / 100,
        quantite_necessaire: qte_totale,
        quantite_manquante: Math.round(manque * 100) / 100,
        suffisant: manque === 0,
      };
    });

    res.json({
      success: true,
      data: {
        plans_total: plans.length,
        periode: { date_debut: date_debut || null, date_fin: date_fin || null },
        besoins,
        materiaux_insuffisants: besoins.filter((b) => !b.suffisant).length,
        tout_disponible: besoins.every((b) => b.suffisant),
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};
