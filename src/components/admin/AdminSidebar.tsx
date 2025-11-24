
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  BarChart,
  Settings,
  UserCheck,
  User,
  Stethoscope,
  LayoutDashboard,
  FileText,
  Bell,
  CreditCard
} from "lucide-react";

export const AdminSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== "/admin" && location.pathname.startsWith(path));
  };

  return (
    <div className="bg-card p-4 space-y-2 min-h-screen w-64 sticky top-0 overflow-y-auto">
      <div className="flex items-center mb-6 px-2">
        <h2 className="font-bold text-lg">Administration</h2>
      </div>

      <nav className="space-y-1">
        <Link to="/admin">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin") && !isActive("/admin/users") && !isActive("/admin/patients") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Tableau de bord
          </Button>
        </Link>

        <h3 className="font-medium text-sm text-gray-500 px-4 pt-4 pb-2">Utilisateurs</h3>
        
        <Link to="/admin/users">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/users") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <Users className="mr-2 h-5 w-5" />
            Utilisateurs
          </Button>
        </Link>
        
        <Link to="/admin/patients">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/patients") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <User className="mr-2 h-5 w-5" />
            Patients
          </Button>
        </Link>
        
        <Link to="/admin/doctors">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/doctors") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <UserCheck className="mr-2 h-5 w-5" />
            Médecins
          </Button>
        </Link>

        <Link to="/admin/doctor-applications">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/doctor-applications") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <UserCheck className="mr-2 h-5 w-5" />
            Demandes médecins
          </Button>
        </Link>

        <h3 className="font-medium text-sm text-gray-500 px-4 pt-4 pb-2">Contenu</h3>
        
        <Link to="/admin/specialties">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/specialties") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <Stethoscope className="mr-2 h-5 w-5" />
            Spécialités
          </Button>
        </Link>
        
        <Link to="/admin/moderation">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/moderation") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <Shield className="mr-2 h-5 w-5" />
            Modération
          </Button>
        </Link>
        
        <Link to="/admin/content">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/content") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <FileText className="mr-2 h-5 w-5" />
            Pages & FAQ
          </Button>
        </Link>

        <h3 className="font-medium text-sm text-gray-500 px-4 pt-4 pb-2">Système</h3>
        
        <Link to="/admin/analytics">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/analytics") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <BarChart className="mr-2 h-5 w-5" />
            Statistiques
          </Button>
        </Link>
        
        <Link to="/admin/notifications">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/notifications") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </Button>
        </Link>
        
        <Link to="/admin/payments">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/payments") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Paiements
          </Button>
        </Link>
        
        <Link to="/admin/settings">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isActive("/admin/settings") ? "bg-gray-100" : ""}`}
            size="lg"
          >
            <Settings className="mr-2 h-5 w-5" />
            Paramètres
          </Button>
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
