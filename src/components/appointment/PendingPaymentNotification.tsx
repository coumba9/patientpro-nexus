
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

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

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <h3 className="text-amber-800 font-medium mb-2">Paiement en attente</h3>
      <p className="text-amber-700 mb-4">
        Vous avez un paiement en attente pour ce rendez-vous. Veuillez confirmer
        que vous avez effectué le paiement via {getPaymentMethodName()}.
      </p>
      <Button
        onClick={onConfirmPayment}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        J'ai effectué le paiement
      </Button>
    </div>
  );
};
