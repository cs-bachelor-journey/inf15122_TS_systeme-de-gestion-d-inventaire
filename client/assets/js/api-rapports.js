// Fonction pour récupérer le rapport des ventes par produit
async function fetchRapportVentesParProduit(debut = null, fin = null) {
  try {
    let url = `${API_BASE_URL}/rapport/ventes/produits`;
    if (debut && fin) {
      url += `?Debut=${debut}&Datefin=${fin}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching rapport ventes par produit:", error);
  }
}

// Fonction pour récupérer l'évolution des ventes mensuelles
async function fetchEvolutionVentesMensuelles(debut = null, fin = null) {
  try {
    let url = `${API_BASE_URL}/rapport/ventes/evolution-mensuelle`;
    if (debut && fin) {
      url += `?Debut=${debut}&Datefin=${fin}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching evolution ventes:", error);
  }
}

// Fonction pour récupérer le rapport des coûts de production par produit
async function fetchRapportCoutsProductionParProduit(debut = null, fin = null) {
  try {
    let url = `${API_BASE_URL}/rapport/couts-production/produits`;
    if (debut && fin) {
      url += `?Debut=${debut}&Datefin=${fin}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching rapport couts production:", error);
  }
}

// Fonction pour récupérer le rapport de consommation des produits bruts
async function fetchRapportConsommationProduitsBruts(debut = null, fin = null) {
  try {
    let url = `${API_BASE_URL}/rapport/consommation/produits-bruts`;
    if (debut && fin) {
      url += `?Debut=${debut}&Datefin=${fin}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching rapport consommation:", error);
  }
}

// Fonction pour récupérer la moyenne de consommation par période
async function fetchMoyenneConsommationParPeriode(debut, fin) {
  try {
    if (!debut || !fin) {
      throw new Error("Les dates Debut et Datefin sont requises");
    }
    const url = `${API_BASE_URL}/rapport/consommation/moyenne-periode?Debut=${debut}&Datefin=${fin}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching moyenne consommation:", error);
  }
}
