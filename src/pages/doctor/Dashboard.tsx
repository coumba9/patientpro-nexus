import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DoctorSidebar } from "@/components/doctor/Sidebar";
import { StatsCards } from "@/components/doctor/StatsCards";
import { AppointmentsList } from "@/components/doctor/AppointmentsList";
import { ConsultationAnalytics } from "@/components/doctor/ConsultationAnalytics";
import { Home, ArrowLeft, UserCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

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
    patient: "Seynabou Seye",
    date: "2024-02-20",
    time: "14:30",
    type: "Consultation",
    status: "confirmed",
    reason: "Suivi traitement",
    isOnline: false,
  },
  {
    id: 2,
    patient: "Ansou Faye",
    date: "2024-02-20",
    time: "15:00",
    type: "Téléconsultation",
    status: "pending",
    reason: "Renouvellement ordonnance",
    isOnline: true,
  },
  {
    id: 3,
    patient: "Sophie Ndiaye",
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
  const { user, userRole, loading } = useAuth();
  const isHomePage = location.pathname === "/doctor";
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(appointments);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || userRole !== "doctor") {
        toast.error("Veuillez vous connecter en tant que médecin");
        navigate("/login");
      }
    }
  }, [user, userRole, loading, navigate]);

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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="mb-6">
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-8 w-8 text-primary" />
                  <span>Bienvenue sur votre espace médecin</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {user?.email ? `Connecté avec: ${user.email}` : "Vous êtes connecté en tant que médecin"}
              </p>
              <div className="flex gap-4 mt-4">
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
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <DoctorSidebar />
          </div>

          <div className="md:col-span-4">
            <StatsCards />
            
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="w-full flex justify-between items-center"
              >
                <span>Statistiques détaillées et suivi des consultations</span>
                {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {showAnalytics && (
                <div className="mt-4 animate-fade-in">
                  <ConsultationAnalytics />
                </div>
              )}
            </div>
            
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
