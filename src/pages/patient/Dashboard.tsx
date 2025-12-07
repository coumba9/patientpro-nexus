import { useState } from "react";
import { toast } from "sonner";
import { Routes, Route, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PatientSidebar } from "@/components/patient/PatientSidebar";
import { NavigationHeader } from "@/components/patient/NavigationHeader";
import { RealAppointmentsPage } from "@/components/patient/RealAppointmentsPage";
import { RealtimeNotifications } from "@/components/patient/RealtimeNotifications";
import { EnhancedDashboard } from "@/components/patient/EnhancedDashboard";
import { PaymentHistory } from "@/components/patient/PaymentHistory";
import { SupportTickets } from "@/components/patient/SupportTickets";
import Messages from "./Messages";
import Documents from "./Documents";
import SettingsPage from "./Settings";
import Profile from "./Profile";
import MedicalHistory from "./MedicalHistory";
import Prescriptions from "./Prescriptions";
import AppointmentTickets from "./AppointmentTickets";
import PatientAppointmentDetails from "./AppointmentDetails";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Heart, X, Search, Home, Info, Phone } from "lucide-react";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isHomePage = location.pathname === "/patient";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/find-doctor", label: "Trouver un médecin", icon: Search },
    { to: "/about", label: "À propos", icon: Info },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header professionnel */}
      <header className="glass-strong py-4 sticky top-0 z-50 border-b border-border/50">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-accent transition-colors"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold gradient-text hidden sm:inline">JàmmSanté</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-muted-foreground hover:text-primary transition-colors font-medium link-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <RealtimeNotifications userId={user?.id || null} userRole="patient" />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="bg-card h-full w-4/5 max-w-xs p-6 shadow-strong animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold gradient-text">JàmmSanté</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-accent rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-accent transition-colors text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5 text-primary" />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="container py-8 flex-grow">
        <NavigationHeader isHomePage={isHomePage} onBack={() => navigate(-1)} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <PatientSidebar />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/" element={<EnhancedDashboard />} />
              <Route path="/appointments" element={<RealAppointmentsPage />} />
              <Route path="/tickets" element={<AppointmentTickets />} />
              <Route path="/appointment/:id" element={<PatientAppointmentDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/medical-history" element={<MedicalHistory />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/payments" element={<PaymentHistory />} />
              <Route path="/support" element={<SupportTickets />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
