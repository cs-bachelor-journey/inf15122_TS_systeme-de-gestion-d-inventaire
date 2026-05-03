import { connectDatabase } from "../db/connectDatabase.js";

// controller pour consulter tous les clients
export const consulterClients = async (req, res) => {
  let connection;
  try {
    const db = await connectDatabase();
    connection = await db.getConnection();
    const [clients] = await connection.query(`
      SELECT id, name, tel, email, web_site, person_to_contact, client_type, adress, ville, region
      FROM Clients
      ORDER BY name
    `);

    res.status(200).json({
      message: "Clients récupérés avec succès",
      data: clients,
    });
  } catch (error) {
    console.error("Erreur lors de la consultation des clients:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la consultation des clients" });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour ajouter un client
export const ajouterClient = async (req, res) => {
  const {
    name,
    tel,
    email,
    web_site,
    person_to_contact,
    client_type,
    adress,
    ville,
    region,
  } = req.body;
  let connection;

  try {
    if (
      !name ||
      !tel ||
      !email ||
      !person_to_contact ||
      !client_type ||
      !adress ||
      !ville ||
      !region
    ) {
      return res
        .status(400)
        .json({ message: "Tous les champs obligatoires sont requis" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    await connection.query(
      `INSERT INTO Clients (name, tel, email, web_site, person_to_contact, client_type, adress, ville, region)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        tel,
        email,
        web_site || "",
        person_to_contact,
        client_type,
        adress,
        ville,
        region,
      ],
    );

    res.status(201).json({
      message: "Client ajouté avec succès",
      data: {
        name,
        tel,
        email,
        web_site,
        person_to_contact,
        client_type,
        adress,
        ville,
        region,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Un client avec cet email existe déjà" });
    }
    console.error("Erreur lors de l'ajout du client:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du client" });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour consulter un client par ID, avec son historique de commandes
export const consulterClientParId = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID du client invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();
    const [rows] = await connection.query(
      `SELECT id, name, tel, email, web_site, person_to_contact, client_type, adress, ville, region
       FROM Clients
       WHERE id = ?`,
      [numericId],
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    const client = rows[0];

    const [commandes] = await connection.query(
      `SELECT
        c.id AS commande_id,
        c.created_at,
        c.delivered_at,
        c.status,
        COUNT(l.id) AS nb_items,
        SUM(l.quantite) AS quantite_totale,
        ROUND(SUM(l.quantite * l.prix_unitaire), 2) AS montant_total
      FROM CommandesProduitTransformer c
      LEFT JOIN LignesCommandeTransforme l ON l.commande_id = c.id
      WHERE c.id_client = ?
      GROUP BY c.id, c.created_at, c.delivered_at, c.status
      ORDER BY c.created_at DESC`,
      [numericId],
    );

    res.status(200).json({
      message: "Client récupéré avec succès",
      data: { ...client, commandes, totalCommandes: commandes.length },
    });
  } catch (error) {
    console.error("Erreur lors de la consultation du client par ID:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la consultation du client par ID" });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour mettre à jour un client
export const mettreAJourClient = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    tel,
    email,
    web_site,
    person_to_contact,
    client_type,
    adress,
    ville,
    region,
  } = req.body;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID du client invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [existing] = await connection.query(`SELECT * FROM Clients WHERE id = ?`, [
      numericId,
    ]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    const current = existing[0];

    await connection.query(
      `UPDATE Clients
       SET name = ?, tel = ?, email = ?, web_site = ?, person_to_contact = ?,
           client_type = ?, adress = ?, ville = ?, region = ?
       WHERE id = ?`,
      [
        name ?? current.name,
        tel ?? current.tel,
        email ?? current.email,
        web_site !== undefined ? web_site : current.web_site,
        person_to_contact ?? current.person_to_contact,
        client_type ?? current.client_type,
        adress ?? current.adress,
        ville ?? current.ville,
        region ?? current.region,
        numericId,
      ],
    );

    res.status(200).json({ message: "Client mis à jour avec succès" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Un client avec cet email existe déjà" });
    }
    console.error("Erreur lors de la mise à jour du client:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du client" });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour supprimer un client
export const supprimerClient = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID du client invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [existing] = await connection.query(`SELECT id FROM Clients WHERE id = ?`, [
      numericId,
    ]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    await connection.query(`DELETE FROM Clients WHERE id = ?`, [numericId]);

    res.status(200).json({ message: "Client supprimé avec succès" });
  } catch (error) {
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_CANNOT_DELETE"
    ) {
      return res
        .status(400)
        .json({
          message:
            "Impossible de supprimer: ce client a des commandes associées",
        });
    }
    console.error("Erreur lors de la suppression du client:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du client" });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour consulter l'historique des commandes d'un client
export const getHistoriqueCommandes = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID du client invalide" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [client] = await connection.query(`SELECT id FROM Clients WHERE id = ?`, [
      numericId,
    ]);
    if (!client || client.length === 0) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    const [commandes] = await connection.query(
      `SELECT
        c.id AS commande_id,
        c.created_at,
        c.delivered_at,
        c.status,
        COUNT(l.id) AS nb_items,
        SUM(l.quantite) AS quantite_totale,
        ROUND(SUM(l.quantite * l.prix_unitaire), 2) AS montant_total
      FROM CommandesProduitTransformer c
      LEFT JOIN LignesCommandeTransforme l ON l.commande_id = c.id
      WHERE c.id_client = ?
      GROUP BY c.id, c.created_at, c.delivered_at, c.status
      ORDER BY c.created_at DESC`,
      [numericId],
    );

    res.status(200).json({
      message: "Historique des commandes récupéré avec succès",
      data: commandes,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la consultation de l'historique des commandes:",
      error,
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la consultation de l'historique des commandes",
      });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour consulter les détails d'une commande d'un client
export const getCommandeDetails = async (req, res) => {
  const { clientId, commandeId } = req.params;
  let connection;

  try {
    const numericClientId = Number(clientId);
    const numericCommandeId = Number(commandeId);
    if (isNaN(numericClientId) || isNaN(numericCommandeId)) {
      return res.status(400).json({ message: "IDs invalides" });
    }

    const db = await connectDatabase();
    connection = await db.getConnection();

    const [commande] = await connection.query(
      `SELECT
        c.id AS commande_id,
        c.id_client,
        cl.name AS client_name,
        c.created_at,
        c.delivered_at,
        c.status
      FROM CommandesProduitTransformer c
      JOIN Clients cl ON cl.id = c.id_client
      WHERE c.id = ? AND c.id_client = ?`,
      [numericCommandeId, numericClientId],
    );

    if (!commande || commande.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

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
      [numericCommandeId],
    );

    const montantTotal = items.reduce(
      (sum, item) => sum + Number(item.sous_total),
      0,
    );

    res.status(200).json({
      message: "Détails de la commande récupérés avec succès",
      data: { ...commande[0], items, montant_total: montantTotal.toFixed(2) },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la consultation des détails de la commande:",
      error,
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la consultation des détails de la commande",
      });
  } finally {
    if (connection) connection.release();
  }
};

// controller pour consulter les types de clients possibles
export const getClientTypes = async (req, res) => {
  try {
    const types = ["particulier", "epicerie", "restaurant"];
    const labels = {
      particulier: "Particulier",
      epicerie: "Épicerie",
      restaurant: "Restaurant",
    };

    res.status(200).json({
      message: "Types de clients récupérés avec succès",
      data: types.map((t) => ({ value: t, label: labels[t] })),
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types de clients:",
      error,
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des types de clients" });
  }
};
