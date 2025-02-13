import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { DoctorInfoCard } from "@/components/appointment/DoctorInfoCard";
import { BookingForm } from "@/components/appointment/BookingForm";

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
    console.log("Booking data:", { ...data, doctorName, specialty });
    toast.success("Rendez-vous pris avec succès !");
    navigate("/patient");
  };

  // Simulation d'un état de connexion (à remplacer par votre logique d'authentification)
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    toast.error("Veuillez vous connecter pour prendre un rendez-vous");
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations du médecin */}
          <div className="md:col-span-1">
            <DoctorInfoCard doctorInfo={doctorInfo} />
          </div>

          {/* Formulaire de réservation */}
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
                <BookingForm
                  doctorName={doctorName}
                  specialty={specialty}
                  doctorFees={doctorInfo.fees}
                  onSubmit={handleSubmit}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
