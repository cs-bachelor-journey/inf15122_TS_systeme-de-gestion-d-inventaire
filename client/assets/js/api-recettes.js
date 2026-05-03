// Fonction pour récupérer toutes les recettes
async function fetchRecettes() {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching recettes:", error);
  }
}

// Fonction pour récupérer une recette par ID (format)
async function fetchRecetteById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching recette by ID:", error);
  }
}

// Fonction pour créer une recette
async function createRecette(recetteData) {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recetteData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error creating recette:", error);
  }
}

// Fonction pour modifier une recette
async function updateRecette(id, recetteData) {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recetteData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error updating recette:", error);
  }
}

// Fonction pour supprimer une recette
async function deleteRecette(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting recette:", error);
  }
}

// Fonction pour ajouter une matière première à une recette
async function addMatiereToRecette(recetteId, matiereData) {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes/${recetteId}/matieres`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(matiereData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error adding matiere:", error);
  }
}

// Fonction pour modifier une matière première
async function updateMatiereRecette(recetteId, matiereId, matiereData) {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes/${recetteId}/matieres/${matiereId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(matiereData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error updating matiere:", error);
  }
}

// Fonction pour supprimer une matière première
async function deleteMatiereRecette(recetteId, matiereId) {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes/${recetteId}/matieres/${matiereId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting matiere:", error);
  }
}

// Fonction pour calculer les matières nécessaires pour une quantité
async function fetchMatieresNecessairesRecette(id, quantite) {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes/${id}/matieres-necessaires?quantite=${quantite}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching matieres necessaires:", error);
  }
}

// Fonction pour valider une recette (vérifier stock)
async function validateRecette(id, quantite) {
  try {
    const response = await fetch(`${API_BASE_URL}/recettes/${id}/validation`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantite }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error validating recette:", error);
  }
}
