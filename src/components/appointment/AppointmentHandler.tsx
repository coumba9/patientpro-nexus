import { BookingFormValues } from "./types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BookingForm } from "./BookingForm";
import { DoctorInfo } from "./doctorTypes";
import { initiatePayTechPayment } from "@/services/paytech";

interface AppointmentHandlerProps {
  doctorName: string | null;
  specialty: string | null;
  doctorInfo: DoctorInfo;
}

export const AppointmentHandler = ({
  doctorName,
  specialty,
  doctorInfo,
}: AppointmentHandlerProps) => {
  const navigate = useNavigate();

  const handleSubmit = async (data: BookingFormValues) => {
    // Vérifier à nouveau si l'utilisateur est connecté avant de finaliser la réservation
    if (!localStorage.getItem("isLoggedIn")) {
      toast.error("Vous devez être connecté pour finaliser la réservation");
      navigate(`/login?redirect=/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}`);
      return;
    }
    
    console.log("Booking data:", { ...data, doctorName, specialty });
    
    // Stocker les informations de réservation dans le localStorage pour pouvoir les récupérer après paiement
    const appointmentData = {
      ...data,
      doctorName,
      specialty,
      timestamp: new Date().toISOString(),
      // Include medical information if provided
      medicalInfo: data.medicalInfo || null
    };
    
    localStorage.setItem("pendingAppointment", JSON.stringify(appointmentData));
    
    // Traitement en fonction du mode de paiement
    if (data.paymentMethod === "paytech") {
      // Intégration PayTech
      const fee = doctorInfo.fees[data.type as keyof typeof doctorInfo.fees] || 0;
      
      try {
        toast.info("Préparation du paiement via PayTech...");
        
        const paymentResponse = await initiatePayTechPayment({
          amount: fee,
          currency: "XOF",
          description: `Rendez-vous médical (${data.type}) avec ${doctorName || "Médecin"} - ${specialty || "Spécialité non spécifiée"}`,
          success_url: `${window.location.origin}/payment-confirmation`,
          cancel_url: `${window.location.origin}/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}`,
          customField: {
            appointmentId: `APPOINTMENT-${Date.now()}`,
            patientId: "PATIENT-001", // Dans une vraie application, ceci viendrait du profil utilisateur
            doctorName: doctorName || "Non spécifié",
            specialty: specialty || "Non spécifié",
            appointmentType: data.type,
            hasMedicalInfo: data.medicalInfo ? "true" : "false"
          }
        });
        
        if (paymentResponse.success && paymentResponse.redirect_url) {
          toast.loading("Redirection vers la plateforme de paiement PayTech...");
          
          // En mode DEV, nous utilisons la simulation qui renvoie directement à success_url
          // En mode production, nous redirigeons vers la page de paiement PayTech
          if (paymentResponse.redirect_url.includes(window.location.origin)) {
            // C'est une simulation, naviguer en interne
            navigate("/payment-confirmation?token=" + paymentResponse.token);
          } else {
            // Redirection externe
            window.location.href = paymentResponse.redirect_url;
          }
        } else {
          toast.error(paymentResponse.message || "Erreur lors de l'initialisation du paiement");
        }
      } catch (error) {
        console.error("PayTech error:", error);
        toast.error("Une erreur est survenue lors de la connexion à PayTech");
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
