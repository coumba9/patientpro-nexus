
import { Button } from "@/components/ui/button";

interface PaymentSummaryProps {
  consultationType: string;
  doctorFees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  onSubmit?: () => void;
  paymentMethod?: string;
}

export const PaymentSummary = ({
  consultationType,
  doctorFees,
  onSubmit,
  paymentMethod,
}: PaymentSummaryProps) => {
  const isOnSite = paymentMethod === "on-site";
  const fee = doctorFees[consultationType as keyof typeof doctorFees] || 0;

  return (
    <div className="pt-4 border-t">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Total :</span>
        <span className="text-xl font-bold">
          {fee} CFA
        </span>
      </div>
      {isOnSite && (
        <p className="text-sm text-muted-foreground mb-3">
          Le paiement sera effectué au cabinet le jour de la consultation.
        </p>
      )}
      <Button 
        type="button" 
        className="w-full"
        onClick={onSubmit}
      >
        {isOnSite ? "Confirmer le rendez-vous" : "Confirmer et payer"}
      </Button>
    </div>
  );
};
