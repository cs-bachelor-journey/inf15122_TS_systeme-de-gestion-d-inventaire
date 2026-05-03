// Fonction pour récupérer les commandes de produits bruts via l'API
async function fetchCommandesProduitBrut() {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes-produit-brut`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes: ", error);
    alert("Erreur lors de la récupération des commandes. Veuillez réessayer.");
  }
}

// Fonction pour récupérer les détails d'une commande via l'API
async function fetchCommandeProduitBrutDetails(commandeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes-produit-brut/${commandeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la commande: ", error);
    alert("Erreur lors de la récupération des détails. Veuillez réessayer.");
  }
}

// Fonction pour créer une commande de produit brut via l'API
async function createCommandeProduitBrut(commandeData) {
  try {
    const response = await fetch(`${API_BASE_URL}/commandes-produit-brut`, {
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
    console.error("Erreur lors de la création de la commande: ", error);
    alert("Erreur lors de la création de la commande. Veuillez réessayer.");
  }
}

// Fonction pour supprimer une commande de produit brut via l'API
async function deleteCommandeProduitBrut(commandeId) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/commandes-produit-brut/${commandeId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    alert("Commande supprimée avec succès.");
    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de la suppression de la commande: ", error);
    alert("Erreur lors de la suppression de la commande. Veuillez réessayer.");
  }
}
