
import { BookingFormValues } from "./types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BookingForm } from "./BookingForm";
import { DoctorInfo } from "./doctorTypes";

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

  const handleSubmit = (data: BookingFormValues) => {
    // Vérifier à nouveau si l'utilisateur est connecté avant de finaliser la réservation
    if (!localStorage.getItem("isLoggedIn")) {
      toast.error("Vous devez être connecté pour finaliser la réservation");
      navigate(`/login?redirect=/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}`);
      return;
    }
    
    console.log("Booking data:", { ...data, doctorName, specialty });
    
    // Redirection en fonction du mode de paiement
    if (data.paymentMethod === "wave") {
      // Simuler une redirection vers Wave
      toast.info("Redirection vers votre compte Wave...");
      
      // Stocker les informations de réservation dans le localStorage pour pouvoir les récupérer après paiement
      localStorage.setItem("pendingAppointment", JSON.stringify({
        ...data,
        doctorName,
        specialty,
        timestamp: new Date().toISOString(),
      }));
      
      // Simuler l'ouverture de l'application Wave (dans un environnement réel, cela pourrait être une URL de redirection)
      setTimeout(() => {
        window.open("https://wave.com/senegal", "_blank");
        toast.success("Après avoir effectué votre paiement, revenez sur cette page pour confirmer votre rendez-vous.");
      }, 1500);
      
      return;
    } else if (data.paymentMethod === "orange-money") {
      toast.info("Redirection vers Orange Money...");
      
      localStorage.setItem("pendingAppointment", JSON.stringify({
        ...data,
        doctorName,
        specialty,
        timestamp: new Date().toISOString(),
      }));
      
      setTimeout(() => {
        window.open("https://orangemoney.orange.sn", "_blank");
        toast.success("Après avoir effectué votre paiement, revenez sur cette page pour confirmer votre rendez-vous.");
      }, 1500);
      
      return;
    } else if (data.paymentMethod === "mobile-money") {
      toast.info("Redirection vers Mobile Money...");
      
      localStorage.setItem("pendingAppointment", JSON.stringify({
        ...data,
        doctorName,
        specialty,
        timestamp: new Date().toISOString(),
      }));
      
      setTimeout(() => {
        window.open("https://mobilemoney.sn", "_blank");
        toast.success("Après avoir effectué votre paiement, revenez sur cette page pour confirmer votre rendez-vous.");
      }, 1500);
      
      return;
    }
    
    // Pour les autres méthodes de paiement
    let paymentMessage = "Rendez-vous pris avec succès !";
    if (["wave", "orange-money", "mobile-money"].includes(data.paymentMethod)) {
      paymentMessage = `Merci de compléter votre paiement avec ${
        data.paymentMethod === "wave" ? "Wave" : 
        data.paymentMethod === "orange-money" ? "Orange Money" : 
        "Mobile Money"
      }. Vous allez recevoir des instructions par SMS.`;
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
