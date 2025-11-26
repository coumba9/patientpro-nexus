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
import { LogOut, Menu } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barre de navigation supérieure */}
      <div className="bg-white dark:bg-gray-900 py-4 border-b dark:border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 transition-all duration-200">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              JàmmSanté
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link to="/find-doctor" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Trouver un médecin
            </Link>
            <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              À propos
            </Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <RealtimeNotifications userId={user?.id || null} userRole="patient" />
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white dark:bg-gray-900 h-full w-4/5 max-w-xs p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-4">
              <Link to="/" className="py-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                Accueil
              </Link>
              <Link to="/find-doctor" className="py-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                Trouver un médecin
              </Link>
              <Link to="/about" className="py-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                À propos
              </Link>
              <Link to="/contact" className="py-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="container py-8 flex-grow">
        <NavigationHeader isHomePage={isHomePage} onBack={() => navigate(-1)} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div>
            <PatientSidebar />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
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
      </div>
    </div>
  );
};

export default PatientDashboard;