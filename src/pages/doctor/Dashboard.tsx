import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DoctorSidebar } from "@/components/doctor/Sidebar";
import { StatsCards } from "@/components/doctor/StatsCards";
import { AppointmentsList } from "@/components/doctor/AppointmentsList";
import { Home, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface Appointment {
  id: number;
  patient: string;
  date: string;
  time: string;
  type: "Consultation" | "Suivi" | "Téléconsultation";
  status: "confirmed" | "pending" | "canceled";
  reason: string;
  isOnline: boolean;
}

const appointments: Appointment[] = [
  {
    id: 1,
    patient: "Marie Dubois",
    date: "2024-02-20",
    time: "14:30",
    type: "Consultation",
    status: "confirmed",
    reason: "Suivi traitement",
    isOnline: false,
  },
  {
    id: 2,
    patient: "Jean Martin",
    date: "2024-02-20",
    time: "15:00",
    type: "Téléconsultation",
    status: "pending",
    reason: "Renouvellement ordonnance",
    isOnline: true,
  },
  {
    id: 3,
    patient: "Sophie Lambert",
    date: "2024-02-20",
    time: "16:00",
    type: "Suivi",
    status: "confirmed",
    reason: "Contrôle post-opératoire",
    isOnline: false,
  },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/doctor";
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(appointments);

  const handleConfirm = (appointmentId: number) => {
    setUpcomingAppointments(prev =>
      prev.map(app =>
        app.id === appointmentId
          ? { ...app, status: "confirmed" as const }
          : app
      )
    );
    toast.success("Rendez-vous confirmé");
  };

  const handleCancel = (appointmentId: number) => {
    setUpcomingAppointments(prev =>
      prev.map(app =>
        app.id === appointmentId
          ? { ...app, status: "canceled" as const }
          : app
      )
    );
    toast.success("Rendez-vous annulé");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="mb-6 flex items-center gap-4">
          {!isHomePage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          )}
          <Link to="/doctor">
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

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <DoctorSidebar />
          </div>

          <div className="md:col-span-4">
            <StatsCards />
            <AppointmentsList
              appointments={upcomingAppointments}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
