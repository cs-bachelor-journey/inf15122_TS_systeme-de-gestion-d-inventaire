// Fonction pour récupérer tous les plans de production
async function fetchPlansProduction() {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching plans:", error);
  }
}

// Fonction pour récupérer un plan par ID
async function fetchPlanProductionById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching plan by ID:", error);
  }
}

// Fonction pour récupérer les détails d'un plan avec ingrédients
async function fetchPlanProductionDetails(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/${id}/details`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching plan details:", error);
  }
}

// Fonction pour créer un plan de production
async function createPlanProduction(planData) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating plan:", error);
  }
}

// Fonction pour mettre à jour un plan de production
async function updatePlanProduction(id, planData) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedPlan = await response.json();
    return updatedPlan.data;
  } catch (error) {
    console.error("Error updating plan:", error);
  }
}

// Fonction pour supprimer un plan de production
async function deletePlanProduction(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting plan:", error);
  }
}

// Fonction pour mettre à jour la durée planifiée
async function updateDureePlanifiee(id, planDuration) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/${id}/duree-planifiee`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan_duration: planDuration }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating duree planifiee:", error);
  }
}

// Fonction pour mettre à jour la durée réelle
async function updateDureeReelle(id, realDuration) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/${id}/duree-reelle`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ real_duration: realDuration }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating duree reelle:", error);
  }
}

// Fonction pour mettre à jour le taux horaire
async function updateTauxHoraire(id, hourlyRate) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/${id}/taux-horaire`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hourly_rate: hourlyRate }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating taux horaire:", error);
  }
}

// Fonction pour récupérer les matières nécessaires pour un plan
async function fetchMatieresNecessairesPlan(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/${id}/matieres-necessaires`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching matieres necessaires:", error);
  }
}

// Fonction pour récupérer la durée de production et coût
async function fetchDureeProductionPlan(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/${id}/duree-production`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching duree production:", error);
  }
}

// Fonction pour comparaison stock (tous les plans sur une période)
async function comparaisonStockPlans(dateDebut, dateFin) {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-production/comparaison-stock?date_debut=${dateDebut}&date_fin=${dateFin}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error comparaison stock:", error);
  }
}
