
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
      consultation: 25000,
      followup: 15000,
      urgent: 35000,
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
