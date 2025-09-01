
import { useNavigate, useSearchParams } from "react-router-dom";
import { DoctorInfoCard } from "@/components/appointment/DoctorInfoCard";
import { useEffect } from "react";
import { NavigationButtons } from "@/components/appointment/NavigationButtons";
import { AppointmentBookingCard } from "@/components/appointment/AppointmentBookingCard";
import { getDefaultDoctorInfo } from "@/components/appointment/doctorTypes";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const doctorName = searchParams.get("doctor");
  const specialty = searchParams.get("specialty");
  const isPending = searchParams.get("pending") === "true";
  const isLoggedIn = !!user;

  // Vérifier si on arrive avec un paramètre pending
  useEffect(() => {
    if (isPending) {
      // Nettoyer l'URL sans rafraîchir la page
      navigate(`/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}`, { replace: true });
      
      // Afficher le message de paiement en attente
      toast.info("Veuillez confirmer votre paiement une fois celui-ci effectué", {
        duration: 5000
      });
    }
  }, [isPending, navigate, doctorName, specialty]);

  const doctorInfo = getDefaultDoctorInfo(doctorName, specialty);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        <NavigationButtons />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations du médecin */}
          <div className="md:col-span-1">
            <DoctorInfoCard doctorInfo={doctorInfo} />
          </div>

          {/* Formulaire de réservation ou message de connexion */}
          <div className="md:col-span-2">
            <AppointmentBookingCard
              doctorName={doctorName}
              specialty={specialty}
              isLoggedIn={isLoggedIn}
              doctorInfo={doctorInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
