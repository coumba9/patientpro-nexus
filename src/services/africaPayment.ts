// Service de paiement utilisant le SDK Africa Payment
import AfricaPayments, {
  PaydunyaPaymentProvider,
  BogusPaymentProvider,
  PaymentEventType
} from "@tecafrik/africa-payment-sdk";

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

// Configuration des fournisseurs de paiement
const DEV_MODE = true; // Utiliser le fournisseur de test en développement

// Initialisation du SDK avec le fournisseur approprié
let africaPayments: AfricaPayments;

if (DEV_MODE) {
  // Utiliser le fournisseur de test (BogusPaymentProvider) en développement
  africaPayments = new AfricaPayments(
    new BogusPaymentProvider({
      instantEvents: true, // Déclencher immédiatement les événements de succès/échec
    })
  );
} else {
  // En production, utiliser Paydunya ou autre fournisseur réel
  africaPayments = new AfricaPayments(
    new PaydunyaPaymentProvider({
      masterKey: "YOUR_PAYDUNYA_MASTER_KEY",
      privateKey: "YOUR_PAYDUNYA_PRIVATE_KEY",
      publicKey: "YOUR_PAYDUNYA_PUBLIC_KEY",
      token: "YOUR_PAYDUNYA_TOKEN",
      mode: "live",
      callbackUrl: "https://votre-domaine.com/webhook/paydunya",
      store: {
        name: "Cabinet Médical",
      },
    })
  );
}

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

// Générer une référence unique pour la transaction
const generateTransactionId = (): string => {
  return `APPOINTMENT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

export const initiateAfricaPayment = async (config: AfricaPaymentConfig): Promise<AfricaPaymentResponse> => {
  try {
    console.log("Initiation du paiement Africa Payment:", config);

    // En mode développement, simuler le processus de paiement
    if (DEV_MODE) {
      const mockToken = generateTransactionId();
      
      // Simuler une redirection pour certaines méthodes
      if (["wave", "orange-money", "mobile-money"].includes(config.paymentMethod)) {
        return {
          success: true,
          redirectUrl: `${window.location.origin}/payment-confirmation?token=${mockToken}&method=${config.paymentMethod}`,
          token: mockToken,
        };
      } else {
        // Paiement direct pour les cartes
        return {
          success: true,
          message: "Paiement traité avec succès (mode test)",
          token: mockToken,
        };
      }
    }

    // En production, utiliser le SDK réel
    const checkoutData = {
      paymentMethod: mapPaymentMethod(config.paymentMethod),
      amount: config.amount,
      description: config.description,
      currency: config.currency === "XOF" ? Currency.XOF : Currency.EUR,
      customer: {
        firstName: config.customer.firstName,
        lastName: config.customer.lastName,
        phoneNumber: config.customer.phoneNumber,
        email: config.customer.email || `${config.customer.firstName.toLowerCase()}.${config.customer.lastName.toLowerCase()}@example.com`,
      },
      transactionId: generateTransactionId(),
      metadata: config.metadata || {},
    };

    console.log("Données de checkout:", checkoutData);

    // Note: Le SDK réel pourrait avoir une API différente
    // Ceci est une simulation basée sur la documentation
    const mockResult = {
      redirectUrl: `https://payment-provider.com/checkout/${checkoutData.transactionId}`,
      transactionId: checkoutData.transactionId,
    };

    return {
      success: true,
      redirectUrl: mockResult.redirectUrl,
      token: mockResult.transactionId,
    };
  } catch (error) {
    console.error("Erreur lors de l'initiation du paiement:", error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Erreur inconnue"],
      message: "Erreur lors de l'initiation du paiement",
    };
  }
};

// Configurer les gestionnaires d'événements pour les webhooks
export const setupPaymentEventHandlers = (
  onSuccess: (event: any) => void,
  onFailure: (event: any) => void
) => {
  africaPayments.on(PaymentEventType.PAYMENT_SUCCESSFUL, (event) => {
    console.log("Paiement réussi:", event);
    onSuccess(event);
  });

  africaPayments.on(PaymentEventType.PAYMENT_FAILED, (event) => {
    console.log("Paiement échoué:", event);
    onFailure(event);
  });
};

// Traiter les webhooks entrants
export const handleWebhook = (body: any) => {
  try {
    africaPayments.handleWebhook(body);
  } catch (error) {
    console.error("Erreur lors du traitement du webhook:", error);
  }
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