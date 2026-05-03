// Fonction pour récupérer la liste des clients
async function fetchClients() {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const clients = await response.json();
    return clients.data;
  } catch (error) {
    console.error("Error fetching clients:", error);
  }
}

// Fonction pour récupérer un client par ID (avec commandes)
async function fetchClientById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const client = await response.json();
    return client.data;
  } catch (error) {
    console.error("Error fetching client by ID:", error);
  }
}

// Fonction pour récupérer les types de clients
async function fetchClientTypes() {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/types`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const types = await response.json();
    return types.data;
  } catch (error) {
    console.error("Error fetching client types:", error);
  }
}

// Fonction pour récupérer l'historique des commandes d'un client
async function fetchClientHistoriqueCommandes(clientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/historique-commandes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching historique:", error);
  }
}

// Fonction pour récupérer les détails d'une commande d'un client
async function fetchClientCommandeDetails(clientId, commandeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/commandes/${commandeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching commande details:", error);
  }
}

// Fonction pour ajouter un client
async function createClient(clientData) {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const newClient = await response.json();
    return newClient.data;
  } catch (error) {
    console.error("Error creating client:", error);
  }
}

// Fonction pour mettre à jour un client
async function updateClient(id, clientData) {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedClient = await response.json();
    return updatedClient.data;
  } catch (error) {
    console.error("Error updating client:", error);
  }
}

// Fonction pour supprimer un client
async function deleteClient(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting client:", error);
  }
}
