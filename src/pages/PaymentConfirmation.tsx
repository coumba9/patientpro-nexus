
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { checkPaymentStatus, getPaymentDetails } from "@/services/paytech";
import { Button } from "@/components/ui/button";

export const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
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
          // Récupérer les détails du paiement
          const details = await getPaymentDetails(token);
          setPaymentDetails(details);
          
          setPaymentSuccess(true);
          toast.success("Paiement confirmé! Votre rendez-vous a été enregistré.");
          
          // Enregistrer le rendez-vous comme confirmé
          const appointmentData = JSON.parse(pendingAppointment);
          const confirmedAppointments = JSON.parse(localStorage.getItem("confirmedAppointments") || "[]");
          confirmedAppointments.push({
            ...appointmentData,
            paymentToken: token,
            paymentDetails: details,
            status: "confirmed",
            confirmedAt: new Date().toISOString()
          });
          localStorage.setItem("confirmedAppointments", JSON.stringify(confirmedAppointments));
          
          // Supprimer le rendez-vous en attente après un délai
          setTimeout(() => {
            localStorage.removeItem("pendingAppointment");
          }, 2000);
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
              Votre rendez-vous a été confirmé. Un récapitulatif vous a été envoyé par email.
            </p>
            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
                <h3 className="font-medium mb-2">Détails du paiement</h3>
                <p className="text-sm mb-1">
                  <span className="font-medium">Montant:</span> {paymentDetails.amount} {paymentDetails.currency}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Date:</span> {new Date(paymentDetails.date).toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Statut:</span> <span className="text-green-600">Complété</span>
                </p>
              </div>
            )}
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
