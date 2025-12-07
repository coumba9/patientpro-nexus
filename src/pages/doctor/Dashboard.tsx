import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DoctorSidebar } from "@/components/doctor/Sidebar";
import { StatsCards } from "@/components/doctor/StatsCards";
import { RealtimeAppointmentsList } from "@/components/doctor/RealtimeAppointmentsList";
import { ConsultationAnalytics } from "@/components/doctor/ConsultationAnalytics";
import { RealtimeNotifications } from "@/components/patient/RealtimeNotifications";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Home, UserCircle, ChevronDown, ChevronUp, Heart, LogOut, Stethoscope } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, loading, logout } = useAuth();
  const isHomePage = location.pathname === "/doctor";
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || userRole !== "doctor") {
        toast.error("Veuillez vous connecter en tant que médecin");
        navigate("/login");
      }
    }
  }, [user, userRole, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header professionnel */}
      <header className="glass-strong py-4 sticky top-0 z-50 border-b border-border/50">
        <div className="container flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">JàmmSanté</span>
          </Link>

          <div className="flex items-center gap-3">
            <RealtimeNotifications userId={user?.id || null} userRole="doctor" />
            <Link to="/">
              <Button variant="outline" size="sm" className="rounded-xl border-border/50 hover:bg-accent">
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Accueil</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-accent to-accent/50 border-primary/20 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-display flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <UserCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-foreground">Bienvenue sur votre espace médecin</span>
                <p className="text-sm font-normal text-muted-foreground mt-1">
                  {user?.email ? `Connecté avec: ${user.email}` : "Gérez vos consultations et patients"}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <DoctorSidebar />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-6">
            <StatsCards doctorId={user?.id || ""} />

            {/* Analytics Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="w-full flex justify-between items-center rounded-xl border-border/50 hover:bg-accent py-6"
            >
              <span className="font-medium">Statistiques détaillées et suivi des consultations</span>
              {showAnalytics ? (
                <ChevronUp className="h-5 w-5 text-primary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>

            {showAnalytics && (
              <div className="animate-fade-in">
                <ConsultationAnalytics />
              </div>
            )}

            <RealtimeAppointmentsList doctorId={user?.id || null} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
