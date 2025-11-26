
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar,
  MessageCircle,
  FileText,
  Settings,
  ClipboardList,
  User,
  Heart,
  Pill,
  LogOut,
  LayoutDashboard,
  CreditCard,
  HelpCircle,
} from "lucide-react";

export const PatientSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
      <h2 className="font-semibold text-lg mb-4">Menu Patient</h2>
      <Link to="/patient">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <LayoutDashboard className="mr-2 h-5 w-5" />
          Tableau de bord
        </Button>
      </Link>
      <Link to="/patient/appointments">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <Calendar className="mr-2 h-5 w-5" />
          Mes rendez-vous
        </Button>
      </Link>
      <Link to="/patient/tickets">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <ClipboardList className="mr-2 h-5 w-5" />
          Mes tickets
        </Button>
      </Link>
      <Link to="/patient/medical-history">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <Heart className="mr-2 h-5 w-5" />
          Dossier médical
        </Button>
      </Link>
      <Link to="/patient/prescriptions">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <Pill className="mr-2 h-5 w-5" />
          Ordonnances
        </Button>
      </Link>
      <Link to="/patient/payments">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <CreditCard className="mr-2 h-5 w-5" />
          Paiements
        </Button>
      </Link>
      <Link to="/patient/messages">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <MessageCircle className="mr-2 h-5 w-5" />
          Messages
        </Button>
      </Link>
      <Link to="/patient/documents">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <FileText className="mr-2 h-5 w-5" />
          Documents
        </Button>
      </Link>
      <Link to="/patient/support">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <HelpCircle className="mr-2 h-5 w-5" />
          Support
        </Button>
      </Link>
      <Link to="/patient/profile">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <User className="mr-2 h-5 w-5" />
          Mon profil
        </Button>
      </Link>
      <Link to="/patient/settings">
        <Button variant="ghost" className="w-full justify-start" size="lg">
          <Settings className="mr-2 h-5 w-5" />
          Paramètres
        </Button>
      </Link>
      {/* Bouton de déconnexion */}
      <Button 
        variant="ghost" 
        className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50" 
        size="lg"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Déconnexion
      </Button>
    </div>
  );
};
