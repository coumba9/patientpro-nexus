
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { DoctorInfoCard } from "@/components/appointment/DoctorInfoCard";
import { BookingForm } from "@/components/appointment/BookingForm";
import { ArrowLeft, Home, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

interface BookingFormValues {
  date: Date;
  time: string;
  type: string;
  consultationType: "presentiel" | "teleconsultation";
  paymentMethod: string;
}

interface DoctorInfo {
  name: string;
  specialty: string;
  fees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  languages: string[];
  experience: string;
  education: string;
  conventions: string;
}

export const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const doctorName = searchParams.get("doctor");
  const specialty = searchParams.get("specialty");
  const navigate = useNavigate();
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

  const doctorInfo: DoctorInfo = {
    name: doctorName || "Dr. Non spécifié",
    specialty: specialty || "Non spécifié",
    fees: {
      consultation: 50,
      followup: 35,
      urgent: 70,
    },
    languages: ["Français", "Anglais"],
    experience: "15 ans",
    education: "Faculté de Médecine de Paris",
    conventions: "Secteur 1 - Conventionné",
  };

  const handleSubmit = (data: BookingFormValues) => {
    // Vérifier à nouveau si l'utilisateur est connecté avant de finaliser la réservation
    if (!localStorage.getItem("isLoggedIn")) {
      toast.error("Vous devez être connecté pour finaliser la réservation");
      navigate(`/login?redirect=/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}`);
      return;
    }
    
    console.log("Booking data:", { ...data, doctorName, specialty });
    toast.success("Rendez-vous pris avec succès !");
    navigate("/patient");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations du médecin */}
          <div className="md:col-span-1">
            <DoctorInfoCard doctorInfo={doctorInfo} />
          </div>

          {/* Formulaire de réservation ou message de connexion */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Prendre rendez-vous</CardTitle>
                <CardDescription>
                  {doctorName && specialty
                    ? `avec ${doctorName} - ${specialty}`
                    : "Nouveau rendez-vous"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoggedIn ? (
                  <div className="text-center py-8">
                    <p className="text-lg mb-6">
                      Vous devez être connecté pour prendre un rendez-vous
                    </p>
                    <Link to={`/login?redirect=/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}`}>
                      <Button className="w-full sm:w-auto">
                        <LogIn className="mr-2 h-5 w-5" />
                        Se connecter
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <BookingForm
                    doctorName={doctorName}
                    specialty={specialty}
                    doctorFees={doctorInfo.fees}
                    onSubmit={handleSubmit}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
