
// PayTech API Documentation: https://paytech.sn/api

interface PayTechPaymentConfig {
  amount: number;
  currency: string;
  description: string;
  ipn_url?: string;
  success_url: string;
  cancel_url: string;
  reference?: string;
  customField?: Record<string, string>;
}

interface PayTechResponse {
  success: boolean;
  token?: string;
  redirect_url?: string;
  errors?: string[];
  message?: string;
}

// En production, ces valeurs seraient stockées dans des variables d'environnement
// ou récupérées depuis un backend sécurisé
const PAYTECH_API_KEY = "YOUR_PAYTECH_API_KEY";
const PAYTECH_API_SECRET = "YOUR_PAYTECH_API_SECRET";

// Option pour simuler un paiement réussi en mode développement
const DEV_MODE = true;

export const initiatePayTechPayment = async (config: PayTechPaymentConfig): Promise<PayTechResponse> => {
  try {
    // Générer une référence unique si non fournie
    if (!config.reference) {
      config.reference = `APPOINTMENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    
    // Mode développement: simuler une redirection vers PayTech sans appeler l'API réelle
    if (DEV_MODE) {
      console.log("DEV MODE: Simulation de paiement PayTech", config);
      
      // Sauvegarder le token dans localStorage pour la simulation
      const mockToken = `mock-${Date.now()}`;
      localStorage.setItem("paytech_last_token", mockToken);
      
      // Construire l'URL de retour avec le token
      const successUrl = new URL(config.success_url);
      successUrl.searchParams.append("token", mockToken);
      
      return {
        success: true,
        token: mockToken,
        redirect_url: successUrl.toString()
      };
    }
    
    // En production, appeler l'API PayTech
    // Attention: ne jamais exposer les clés API dans le frontend en production
    // Cette logique devrait être gérée par un service backend sécurisé
    const response = await fetch("https://paytech.sn/api/payment/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": PAYTECH_API_KEY,
        "X-API-SECRET": PAYTECH_API_SECRET
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      throw new Error(`PayTech API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        token: data.token,
        redirect_url: data.redirect_url
      };
    } else {
      return {
        success: false,
        errors: data.errors || ["Une erreur s'est produite"],
        message: data.message
      };
    }
  } catch (error) {
    console.error("PayTech payment error:", error);
    return {
      success: false,
      errors: ["Erreur de connexion à PayTech"],
      message: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
};

// Fonction pour vérifier l'état du paiement (généralement appelée par le gestionnaire de success_url)
export const checkPaymentStatus = async (token: string): Promise<boolean> => {
  try {
    // Si en mode développement, simulons une vérification réussie
    if (DEV_MODE) {
      console.log("DEV MODE: Vérification du paiement pour le token:", token);
      const storedToken = localStorage.getItem("paytech_last_token");
      
      // Vérifier si le token correspond
      if (storedToken === token) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
      }
      return false;
    }
    
    // En production, appeler l'API de vérification de PayTech
    const response = await fetch(`https://paytech.sn/api/payment/check-status/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": PAYTECH_API_KEY,
        "X-API-SECRET": PAYTECH_API_SECRET
      }
    });
    
    if (!response.ok) {
      throw new Error(`PayTech status check error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success && data.status === "completed";
  } catch (error) {
    console.error("Error checking payment status:", error);
    return false;
  }
};

// Fonction pour récupérer les détails d'un paiement
export const getPaymentDetails = async (token: string): Promise<any> => {
  try {
    if (DEV_MODE) {
      console.log("DEV MODE: Récupération des détails de paiement pour le token:", token);
      return {
        amount: 15000,
        currency: "XOF",
        status: "completed",
        date: new Date().toISOString()
      };
    }
    
    // En production, appeler l'API PayTech
    const response = await fetch(`https://paytech.sn/api/payment/details/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": PAYTECH_API_KEY,
        "X-API-SECRET": PAYTECH_API_SECRET
      }
    });
    
    if (!response.ok) {
      throw new Error(`PayTech details error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting payment details:", error);
    throw error;
  }
};
