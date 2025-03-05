
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { checkPaymentStatus } from "@/services/paytech";

export const PayTechPaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    const token = searchParams.get("token");
    const pendingAppointment = localStorage.getItem("pendingAppointment");
    
    if (!token || !pendingAppointment) {
      toast.error("Informations de paiement manquantes");
      navigate("/");
      return;
    }
    
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        const isSuccess = await checkPaymentStatus(token);
        
        if (isSuccess) {
          toast.success("Paiement confirmé! Votre rendez-vous a été enregistré.");
          localStorage.removeItem("pendingAppointment");
          navigate("/patient");
        } else {
          toast.error("Échec de la vérification du paiement");
          navigate("/book-appointment");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Une erreur est survenue lors de la vérification du paiement");
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPayment();
  }, [navigate, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {isVerifying ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Vérification du paiement</h2>
            <p className="text-muted-foreground">
              Veuillez patienter pendant que nous vérifions votre paiement...
            </p>
          </>
        ) : (
          <p>Redirection...</p>
        )}
      </div>
    </div>
  );
};
