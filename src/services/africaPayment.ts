// Service de paiement utilisant Supabase Edge Functions
// Le SDK @tecafrik/africa-payment-sdk est utilisé côté serveur seulement

// Enum pour les méthodes de paiement
export enum PaymentMethod {
  WAVE = "wave",
  ORANGE_MONEY = "orange_money", 
  MTN_MOBILE_MONEY = "mtn_mobile_money",
  CREDIT_CARD = "credit_card"
}

// Enum pour les devises
export enum Currency {
  XOF = "XOF",
  EUR = "EUR", 
  USD = "USD"
}

export interface AfricaPaymentConfig {
  amount: number;
  currency: string;
  description: string;
  customer: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
  };
  metadata?: Record<string, any>;
  paymentMethod: string;
}

export interface AfricaPaymentResponse {
  success: boolean;
  redirectUrl?: string;
  token?: string;
  errors?: string[];
  message?: string;
}

// Générer une référence unique pour la transaction
const generateTransactionId = (): string => {
  return `APPOINTMENT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// Mapper les méthodes de paiement de l'application vers celles du SDK
const mapPaymentMethod = (method: string): PaymentMethod => {
  switch (method) {
    case "wave":
      return PaymentMethod.WAVE;
    case "orange-money":
      return PaymentMethod.ORANGE_MONEY;
    case "mobile-money":
      return PaymentMethod.MTN_MOBILE_MONEY;
    case "card":
      return PaymentMethod.CREDIT_CARD;
    default:
      return PaymentMethod.WAVE; // Par défaut
  }
};

export const initiateAfricaPayment = async (config: AfricaPaymentConfig): Promise<AfricaPaymentResponse> => {
  try {
    console.log("Initiation du paiement sécurisé:", config);

    // Import Supabase client
    const { supabase } = await import("@/integrations/supabase/client");

    // Call secure payment edge function
    const { data, error } = await supabase.functions.invoke('secure-payment', {
      body: {
        amount: config.amount,
        currency: config.currency,
        description: config.description,
        customer: config.customer,
        metadata: config.metadata,
        paymentMethod: config.paymentMethod
      }
    });

    if (error) {
      console.error("Erreur de paiement sécurisé:", error);
      return {
        success: false,
        errors: [error.message || "Erreur de connexion au service de paiement"],
        message: "Erreur lors de l'initiation du paiement",
      };
    }

    return data as AfricaPaymentResponse;
  } catch (error) {
    console.error("Erreur lors de l'initiation du paiement:", error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Erreur inconnue"],
      message: "Erreur lors de l'initiation du paiement",
    };
  }
};

// Les événements de paiement sont maintenant gérés côté serveur via webhooks
export const setupPaymentEventHandlers = (
  onSuccess: (event: any) => void,
  onFailure: (event: any) => void
) => {
  console.log("Event handlers configurés pour les webhooks côté serveur");
  // Les événements seront gérés via des appels API aux callbacks
};

// Traiter les webhooks entrants (utilisé côté serveur)
export const handleWebhook = (body: any) => {
  console.log("Webhook reçu côté client - à traiter côté serveur:", body);
};

// Méthodes de paiement supportées par le SDK
export const getSupportedPaymentMethods = () => [
  {
    id: "wave",
    name: "Wave",
    icon: "Wallet",
    color: "blue-600",
    description: "Paiement mobile Wave"
  },
  {
    id: "orange-money",
    name: "Orange Money",
    icon: "Phone",
    color: "orange-500",
    description: "Paiement mobile Orange Money"
  },
  {
    id: "mobile-money",
    name: "MTN Mobile Money",
    icon: "Phone",
    color: "yellow-500",
    description: "Paiement mobile MTN"
  },
  {
    id: "card",
    name: "Carte bancaire",
    icon: "CreditCard",
    color: "gray-600",
    description: "Paiement par carte de crédit/débit"
  }
];