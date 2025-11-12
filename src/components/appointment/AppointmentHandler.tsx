import { BookingFormValues } from "./types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BookingForm } from "./BookingForm";
import { DoctorInfo } from "./doctorTypes";
import { initiatePayTechPayment } from "@/services/paytech";
import { getSupportedPaymentMethods } from "@/services/africaPayment";
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

    // Vérifier la disponibilité du créneau AVANT le paiement
    if (doctorId && data.date && data.time) {
      try {
        const { appointmentService } = await import("@/api");
        const slotCheck = await appointmentService.checkSlotAvailability({
          doctor_id: doctorId,
          date: data.date.toISOString ? data.date.toISOString().split('T')[0] : new Date(data.date).toISOString().split('T')[0],
          time: data.time
        });

        if (!slotCheck.available) {
          toast.error(slotCheck.error || "Ce créneau n'est plus disponible. Veuillez en choisir un autre.");
          return;
        }
      } catch (error: any) {
        toast.error("Erreur lors de la vérification de la disponibilité");
        return;
      }
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
      // Intégration PayTech
      const fee = doctorInfo.fees[data.type as keyof typeof doctorInfo.fees] || 0;
      
      try {
        const methodName = getSupportedPaymentMethods().find(m => m.id === data.paymentMethod)?.name || "PayTech";
        toast.info(`Préparation du paiement via ${methodName}...`);
        
        const successUrl = `${window.location.origin}/payment-confirmation?method=${encodeURIComponent(data.paymentMethod)}`;
        const cancelUrl = `${window.location.origin}/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}&cancelled=1`;
        
        const paymentResponse = await initiatePayTechPayment({
          amount: fee,
          currency: "XOF",
          description: `Rendez-vous médical (${data.type}) avec ${doctorName || "Médecin"} - ${specialty || "Spécialité non spécifiée"}`,
          success_url: successUrl,
          cancel_url: cancelUrl,
          reference: `APPOINTMENT-${Date.now()}`,
          customField: {
            doctorName: doctorName || "Non spécifié",
            specialty: specialty || "Non spécifié",
            appointmentType: data.type,
            hasMedicalInfo: data.medicalInfo ? "true" : "false"
          }
        });
        
        if (paymentResponse.success) {
          if (paymentResponse.token) {
            try { localStorage.setItem("paytech_last_token", paymentResponse.token); } catch {}
          }
          if (paymentResponse.redirect_url) {
            toast.loading(`Redirection vers la plateforme de paiement ${methodName}...`);
            window.location.href = paymentResponse.redirect_url;
          } else if (paymentResponse.token) {
            navigate(`/payment-confirmation?token=${paymentResponse.token}&method=${data.paymentMethod}`);
          } else {
            toast.error("Réponse de paiement invalide");
          }
        } else {
          toast.error(paymentResponse.message || "Erreur lors de l'initialisation du paiement");
        }
      } catch (error) {
        console.error("PayTech error:", error);
        toast.error("Une erreur est survenue lors de la connexion au service de paiement");
      }
      
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
