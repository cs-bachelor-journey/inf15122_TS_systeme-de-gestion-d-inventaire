// Fonction pour récupérer toutes les commandes
async function fetchCommandes() {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching commandes:", error);
  }
}

// Fonction pour récupérer les détails d'une commande par ID
async function fetchCommandeById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching commande by ID:", error);
  }
}

// Fonction pour créer une commande
async function createCommande(commandeData) {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commandeData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating commande:", error);
  }
}

// Fonction pour modifier une commande
async function updateCommande(id, commandeData) {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commandeData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedCommande = await response.json();
    return updatedCommande.data;
  } catch (error) {
    console.error("Error updating commande:", error);
  }
}

// Fonction pour supprimer une commande
async function deleteCommande(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting commande:", error);
  }
}

// Fonction pour changer le statut d'une commande
async function changeCommandeStatut(id, newStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes/${id}/statut`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error changing statut:", error);
  }
}

// Fonction pour ajouter une ligne de commande
async function addCommandeLigne(commandeId, ligneData) {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes/${commandeId}/lignes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ligneData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error adding ligne:", error);
  }
}

// Fonction pour supprimer une ligne de commande
async function deleteCommandeLigne(commandeId, ligneId) {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes/${commandeId}/lignes/${ligneId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting ligne:", error);
  }
}
