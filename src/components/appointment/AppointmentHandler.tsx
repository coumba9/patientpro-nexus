import { BookingFormValues } from "./types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BookingForm } from "./BookingForm";
import { DoctorInfo } from "./doctorTypes";
import { initiateAfricaPayment, getSupportedPaymentMethods } from "@/services/africaPayment";
import { useAuth } from "@/hooks/useAuth";

interface AppointmentHandlerProps {
  doctorId: string | null;
  doctorName: string | null;
  specialty: string | null;
  doctorInfo: DoctorInfo;
}

export const AppointmentHandler = ({
  doctorId,
  doctorName,
  specialty,
  doctorInfo,
}: AppointmentHandlerProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const handleSubmit = async (data: BookingFormValues) => {
    // Wait for auth to finish loading
    if (authLoading) {
      toast.info("Vérification de la connexion...");
      return;
    }
    
    // Vérifier à nouveau si l'utilisateur est connecté avant de finaliser la réservation
    if (!user) {
      toast.error("Vous devez être connecté pour finaliser la réservation");
      navigate(`/login?redirect=/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}`);
      return;
    }
    
    console.log("Booking data:", { ...data, doctorName, specialty });
    
    // Stocker les informations de réservation dans le localStorage pour pouvoir les récupérer après paiement
    const appointmentData = {
      ...data,
      doctorId,
      doctorName,
      specialty,
      timestamp: new Date().toISOString(),
      // Include medical information if provided
      medicalInfo: data.medicalInfo || null
    };
    
    localStorage.setItem("pendingAppointment", JSON.stringify(appointmentData));
    
    // Traitement en fonction du mode de paiement
    const supportedMethods = getSupportedPaymentMethods().map(m => m.id);
    
    if (supportedMethods.includes(data.paymentMethod)) {
      // Intégration Africa Payment SDK
      const fee = doctorInfo.fees[data.type as keyof typeof doctorInfo.fees] || 0;
      
      try {
        const methodName = getSupportedPaymentMethods().find(m => m.id === data.paymentMethod)?.name || "Africa Payment";
        toast.info(`Préparation du paiement via ${methodName}...`);
        
        const paymentResponse = await initiateAfricaPayment({
          amount: fee,
          currency: "XOF",
          description: `Rendez-vous médical (${data.type}) avec ${doctorName || "Médecin"} - ${specialty || "Spécialité non spécifiée"}`,
          customer: {
            firstName: data.firstName || "Prénom",
            lastName: data.lastName || "Nom",
            phoneNumber: data.phone || "+221000000000",
            email: data.email,
          },
          metadata: {
            appointmentId: `APPOINTMENT-${Date.now()}`,
            patientId: "PATIENT-001", // Dans une vraie application, ceci viendrait du profil utilisateur
            doctorName: doctorName || "Non spécifié",
            specialty: specialty || "Non spécifié",
            appointmentType: data.type,
            hasMedicalInfo: data.medicalInfo ? "true" : "false"
          },
          paymentMethod: data.paymentMethod
        });
        
        if (paymentResponse.success) {
          if (paymentResponse.redirectUrl) {
            toast.loading(`Redirection vers la plateforme de paiement ${methodName}...`);
            // Redirection externe vers le fournisseur de paiement
            window.location.href = paymentResponse.redirectUrl;
          } else {
            // Paiement traité directement (mode test)
            toast.success("Paiement traité avec succès !");
            navigate("/payment-confirmation?token=" + paymentResponse.token);
          }
        } else {
          toast.error(paymentResponse.message || "Erreur lors de l'initialisation du paiement");
        }
      } catch (error) {
        console.error("Africa Payment error:", error);
        toast.error("Une erreur est survenue lors de la connexion au service de paiement");
      }
      
      return;
    } else if (["wave", "orange-money", "mobile-money"].includes(data.paymentMethod)) {
      // Comportement pour les autres méthodes de paiement mobile
      const paymentMethodName = 
        data.paymentMethod === "wave" ? "Wave" : 
        data.paymentMethod === "orange-money" ? "Orange Money" : "Mobile Money";
      
      toast.info(`Préparation du paiement via ${paymentMethodName}...`, {
        duration: 2000
      });
      
      const redirectUrls = {
        "wave": "https://wave.com/senegal",
        "orange-money": "https://orangemoney.orange.sn",
        "mobile-money": "https://mobilemoney.sn"
      };
      
      setTimeout(() => {
        window.open(redirectUrls[data.paymentMethod as keyof typeof redirectUrls], "_blank");
        
        // Rediriger l'utilisateur vers la même page mais avec un statut de paiement en attente
        navigate(`/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}&pending=true`);
        
        toast.success("Après avoir effectué votre paiement, vous pouvez confirmer votre rendez-vous.");
      }, 1500);
      
      return;
    }
    
    // Pour les autres méthodes de paiement
    let paymentMessage = "Rendez-vous pris avec succès !";
    if (["card", "thirdparty", "cash"].includes(data.paymentMethod)) {
      paymentMessage = `Rendez-vous confirmé. ${
        data.paymentMethod === "card" ? "Votre carte a été débitée." : 
        data.paymentMethod === "thirdparty" ? "Votre tiers payant a été informé." : 
        "Veuillez prévoir un paiement en espèces lors de votre visite."
      }`;
    }
    
    toast.success(paymentMessage);
    navigate("/patient");
  };

  return (
    <BookingForm
      doctorName={doctorName}
      specialty={specialty}
      doctorFees={doctorInfo.fees}
      onSubmit={handleSubmit}
    />
  );
};
