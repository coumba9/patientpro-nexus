
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

// In production, these would be stored in environment variables
// or fetched from a secure backend
const PAYTECH_API_KEY = "YOUR_PAYTECH_API_KEY";
const PAYTECH_API_SECRET = "YOUR_PAYTECH_API_SECRET";

export const initiatePayTechPayment = async (config: PayTechPaymentConfig): Promise<PayTechResponse> => {
  try {
    // Generate a unique reference if not provided
    if (!config.reference) {
      config.reference = `APPOINTMENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    
    // For demonstration purposes only - in production, never expose API keys in frontend code
    // This should be handled by a secure backend service
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

// Function to check payment status (typically called by the success_url handler)
export const checkPaymentStatus = async (token: string): Promise<boolean> => {
  try {
    // In a real implementation, this would call PayTech's status API
    // For demo purposes, we'll just return true
    console.log("Checking payment status for token:", token);
    return true;
  } catch (error) {
    console.error("Error checking payment status:", error);
    return false;
  }
};
