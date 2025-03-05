
import { Button } from "@/components/ui/button";

interface PaymentSummaryProps {
  consultationType: string;
  doctorFees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  onSubmit?: () => void;
}

export const PaymentSummary = ({
  consultationType,
  doctorFees,
  onSubmit,
}: PaymentSummaryProps) => {
  return (
    <div className="pt-4 border-t">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">Total à payer :</span>
        <span className="text-xl font-bold">
          {doctorFees[consultationType as keyof typeof doctorFees]} CFA
        </span>
      </div>
      <Button 
        type="button" 
        className="w-full"
        onClick={onSubmit}
      >
        Confirmer et payer
      </Button>
    </div>
  );
};
