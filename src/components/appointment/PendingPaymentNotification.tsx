
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface PendingPaymentNotificationProps {
  paymentMethod: string;
  onConfirmPayment: () => void;
}

export const PendingPaymentNotification = ({
  paymentMethod,
  onConfirmPayment,
}: PendingPaymentNotificationProps) => {
  const getPaymentMethodName = () => {
    if (paymentMethod === "wave") return "Wave";
    if (paymentMethod === "orange-money") return "Orange Money";
    if (paymentMethod === "mobile-money") return "Mobile Money";
    if (paymentMethod === "paytech") return "PayTech";
    return "Paiement mobile";
  };

  const getPaymentInstructions = () => {
    if (paymentMethod === "paytech") {
      return "Vous avez été redirigé vers la plateforme PayTech. Si vous n'avez pas terminé votre paiement, veuillez cliquer à nouveau sur 'Confirmer et payer'.";
    } else if (["wave", "orange-money", "mobile-money"].includes(paymentMethod)) {
      return `Vous avez été redirigé vers ${getPaymentMethodName()}. Veuillez compléter votre paiement dans l'application ${getPaymentMethodName()} et cliquer sur le bouton ci-dessous pour confirmer.`;
    }
    return "Veuillez confirmer que vous avez effectué le paiement.";
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="text-amber-600 h-5 w-5 mr-2 mt-0.5" />
        <div>
          <h3 className="text-amber-800 font-medium mb-2">Paiement en attente</h3>
          <p className="text-amber-700 mb-4">
            {getPaymentInstructions()}
          </p>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={onConfirmPayment}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              J'ai effectué le paiement
            </Button>
            <p className="text-xs text-amber-600 text-center mt-2">
              Votre rendez-vous sera confirmé après vérification du paiement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
