
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { checkPaymentStatus } from "@/services/paytech";
import { Button } from "@/components/ui/button";

export const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    const token = searchParams.get("token");
    const pendingAppointment = localStorage.getItem("pendingAppointment");
    
    if (!token || !pendingAppointment) {
      toast.error("Informations de paiement manquantes");
      navigate("/book-appointment");
      return;
    }
    
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        const isSuccess = await checkPaymentStatus(token);
        
        if (isSuccess) {
          setPaymentSuccess(true);
          toast.success("Paiement confirmé! Votre rendez-vous a été enregistré.");
          setTimeout(() => {
            localStorage.removeItem("pendingAppointment");
            navigate("/patient");
          }, 3000);
        } else {
          setPaymentSuccess(false);
          toast.error("Échec de la vérification du paiement");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setPaymentSuccess(false);
        toast.error("Une erreur est survenue lors de la vérification du paiement");
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPayment();
  }, [navigate, searchParams]);
  
  const handleReturn = () => {
    if (paymentSuccess) {
      navigate("/patient");
    } else {
      navigate("/book-appointment");
    }
  };
  
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
        ) : paymentSuccess === true ? (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Paiement réussi!</h2>
            <p className="mb-6">
              Votre rendez-vous a été confirmé. Vous serez redirigé vers votre tableau de bord.
            </p>
            <Button onClick={handleReturn} className="w-full">
              Aller au tableau de bord
            </Button>
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Paiement échoué</h2>
            <p className="mb-6">
              Nous n'avons pas pu vérifier votre paiement. Veuillez réessayer ou choisir une autre méthode de paiement.
            </p>
            <Button onClick={handleReturn} variant="outline" className="w-full">
              Retour à la réservation
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
