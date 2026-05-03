// Fonction pour extraire l'ID du produit brut depuis l'URL
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// fonction pour extraire les deux premières lettres du nom  du fournisseur
function firstTwoLettersOfName(name) {
  if (name || name.length >= 2) {
    // Retourne les deux premières lettres en majuscules
    return name.substring(0, 2).toUpperCase();
  }
}

// recupérer la liste des fournisseurs
async function fetchFournisseurs() {
  try {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const fournisseurs = await response.json();
    return fournisseurs.data;
  } catch (error) {
    console.error("Error fetching fournisseurs:", error);
  }
}

// Fonction pour récupérer les produits bruts depuis l'API
async function fetchProduitsBrut() {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-bruts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Retourne uniquement la liste des produits bruts
    return data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits bruts: ", error);
    alert(
      "Erreur lors de la récupération des produits bruts. Veuillez réessayer.",
    );
  }
}

// recupérer un fournisseur par son ID avec les produits associés
async function fetchFournisseurById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const fournisseur = await response.json();
    return fournisseur.data;
  } catch (error) {
    console.error("Error fetching fournisseur by ID:", error);
  }
}

// créer un nouveau fournisseur
async function createFournisseur(fournisseurData) {
  try {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fournisseurData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const newFournisseur = await response.json();
    return newFournisseur.data;
  } catch (error) {
    console.error("Error creating fournisseur:", error);
  }
}

// mettre à jour un fournisseur existant
async function updateFournisseur(id, fournisseurData) {
  try {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fournisseurData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedFournisseur = await response.json();
    return updatedFournisseur.data;
  } catch (error) {
    console.error("Error updating fournisseur:", error);
  }
}

// supprimer un fournisseur
async function deleteFournisseur(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting fournisseur:", error);
  }
}

// associer un produit à un fournisseur
async function associateProduitToFournisseur(supplierId, rawProductId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/fournisseurs/${supplierId}/produits-bruts/${rawProductId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error associating produit to fournisseur:", error);
  }
}

// définir le prix et la quantité minimum pour un produit d'un fournisseur
async function setPrixFournisseurQuantite(supplierId, rawProductId, data) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/fournisseurs/prix/${supplierId}/produits-bruts/${rawProductId}/quantite`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error setting prix and quantite:", error);
  }
}
