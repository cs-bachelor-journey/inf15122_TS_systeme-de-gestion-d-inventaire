// Fonction pour récupérer tous les produits transformés
async function fetchProduitsTransformes() {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-transformes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching produits transformes:", error);
  }
}

// Fonction pour récupérer un produit transformé par ID
async function fetchProduitTransformeById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-transformes/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching produit transforme by ID:", error);
  }
}

// Fonction pour récupérer l'inventaire complet
async function fetchInventaireProduitsTransformes() {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-transformes/inventaire`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching inventaire:", error);
  }
}

// Fonction pour créer un produit transformé
async function createProduitTransforme(produitData) {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-transformes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(produitData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating produit transforme:", error);
  }
}

// Fonction pour modifier un produit transformé
async function updateProduitTransforme(id, produitData) {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-transformes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(produitData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedProduit = await response.json();
    return updatedProduit.data;
  } catch (error) {
    console.error("Error updating produit transforme:", error);
  }
}

// Fonction pour supprimer un produit transformé
async function deleteProduitTransforme(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-transformes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting produit transforme:", error);
  }
}

// Fonction pour créer un format
async function createFormatProduitTransforme(formatData) {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-transformes/formats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formatData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating format:", error);
  }
}

// Fonction pour mettre à jour le stock d'un format
async function updateStockProduitTransforme(id, stockData) {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-transformes/${id}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stockData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error updating stock:", error);
  }
}

// Fonction pour définir un prix
async function setPrixProduitTransforme(prixData) {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-transformes/prix`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prixData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error setting prix:", error);
  }
}
