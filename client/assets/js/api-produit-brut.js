// Fonction pour extraire l'ID du produit brut depuis l'URL
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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

// Fonction pour récupérer les détails d'un produit brut spécifique depuis l'API
async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-bruts/${productId}`);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des détails du produit");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du produit :",
      error,
    );
    return null;
  }
}

// Fonction pour modifier un produit brut via l'API
async function updateProduitBrut(produitId, updatedData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/produits-bruts/${produitId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Produit brut modifié avec succès.");
  } catch (error) {
    console.error("Erreur lors de la modification du produit brut: ", error);
    alert("Erreur lors de la modification du produit. Veuillez réessayer.");
  }
}

// supprimer un produit brut via l'API
async function deleteProduitBrut(produitId) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit brut ?")) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/produits-bruts/${produitId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    alert("Produit brut supprimé avec succès.");

    // Rafraîchir la liste des produits bruts après la suppression
    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de la suppression du produit brut: ", error);
    alert("Erreur lors de la suppression du produit brut. Veuillez réessayer.");
  }
}

// Fonction pour récupérer les unités de mesure disponibles depuis l'API
async function getUnites() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/produits-bruts/unites-mesure`,
    );
    if (response.ok) {
      const unites = await response.json();
      // Retourne uniquement la liste des unités de mesure
      return unites.data;
    } else {
      console.error("Failed to fetch units.");
    }
  } catch (error) {
    console.error("Error fetching units:", error);
  }
}

// Fonction pour entrer un produit brut en stock via l'API
async function stockInProduitBrut(produitId, quantity) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/produits-bruts/stock-in/${produitId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Produit brut entré en stock avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'entrée en stock du produit brut: ", error);
    alert(
      "Erreur lors de l'entrée en stock du produit brut. Veuillez réessayer.",
    );
  }
}

// Fonction pour sortir un produit brut du stock via l'API
async function stockOutProduitBrut(produitId, quantity) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/produits-bruts/stock-out/${produitId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Produit brut sorti du stock avec succès.");
  } catch (error) {
    console.error("Erreur lors de la sortie du stock du produit brut: ", error);
    alert(
      "Erreur lors de la sortie du stock du produit brut. Veuillez réessayer.",
    );
  }
}

// Fonction pour récupérer les produits bruts par fournisseur
async function fetchProduitsBrutsParFournisseur() {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-bruts/par-fournisseur`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération par fournisseur: ", error);
  }
}

// Fonction pour créer un produit brut via l'API
async function createProduitBrut(produitData) {
  try {
    const response = await fetch(`${API_BASE_URL}/produits-bruts`, {
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
    console.error("Erreur lors de la création du produit brut: ", error);
    alert("Erreur lors de la création du produit. Veuillez réessayer.");
  }
}
