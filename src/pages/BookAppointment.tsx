
import { useNavigate, useSearchParams } from "react-router-dom";
import { DoctorInfoCard } from "@/components/appointment/DoctorInfoCard";
import { useEffect, useState } from "react";
import { NavigationButtons } from "@/components/appointment/NavigationButtons";
import { AppointmentBookingCard } from "@/components/appointment/AppointmentBookingCard";
import { getDefaultDoctorInfo } from "@/components/appointment/doctorTypes";

export const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const doctorName = searchParams.get("doctor");
  const specialty = searchParams.get("specialty");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Vérifier l'état de connexion au chargement du composant
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      console.log("BookAppointment - Login status:", loginStatus);
      setIsLoggedIn(loginStatus);
    };
    
    // Vérifier immédiatement
    checkLoginStatus();
    
    // Configurer l'écouteur d'événements
    window.addEventListener('storage', checkLoginStatus);
    
    // Nettoyage
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

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
