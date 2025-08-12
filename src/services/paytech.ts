
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

// Option pour simuler un paiement réussi en mode développement
const DEV_MODE = true;

export const initiatePayTechPayment = async (config: PayTechPaymentConfig): Promise<PayTechResponse> => {
  try {
    // Import supabase client
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Authentication required");
    }

    // Call secure edge function instead of direct API
    const { data, error } = await supabase.functions.invoke('secure-paytech', {
      body: config,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("PayTech edge function error:", error);
      return {
        success: false,
        errors: ["Erreur de connexion au service de paiement"],
        message: error.message
      };
    }

    if (data.success) {
      // For development mode, handle redirect directly
      if (DEV_MODE && data.redirect_url) {
        setTimeout(() => {
          window.location.href = data.redirect_url;
        }, 1000);
      }
      
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
    
    // En production, utiliser l'edge function sécurisée pour vérifier le statut
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("Authentication required for payment status check");
      return false;
    }

    const { data, error } = await supabase.functions.invoke('secure-paytech-status', {
      body: { token },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("Payment status check error:", error);
      return false;
    }

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
    
    // En production, utiliser l'edge function sécurisée
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Authentication required for payment details");
    }

    const { data, error } = await supabase.functions.invoke('secure-paytech-details', {
      body: { token },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("Payment details error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting payment details:", error);
    throw error;
  }
};
