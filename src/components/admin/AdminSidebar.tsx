
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  BarChart,
  Settings,
  UserCheck,
  User,
  Stethoscope
} from "lucide-react";

export const AdminSidebar = () => {
  const location = useLocation();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-2 h-screen">
      <h2 className="font-semibold text-lg mb-4">Administration</h2>
      <Link to="/admin/users">
        <Button
          variant="ghost"
          className={`w-full justify-start ${location.pathname === "/admin/users" ? "bg-gray-100" : ""}`}
          size="lg"
        >
          <Users className="mr-2 h-5 w-5" />
          Utilisateurs
        </Button>
      </Link>
      <Link to="/admin/patients">
        <Button
          variant="ghost"
          className={`w-full justify-start ${location.pathname === "/admin/patients" ? "bg-gray-100" : ""}`}
          size="lg"
        >
          <User className="mr-2 h-5 w-5" />
          Patients
        </Button>
      </Link>
      <Link to="/admin/specialties">
        <Button
          variant="ghost"
          className={`w-full justify-start ${location.pathname === "/admin/specialties" ? "bg-gray-100" : ""}`}
          size="lg"
        >
          <Stethoscope className="mr-2 h-5 w-5" />
          Spécialités
        </Button>
      </Link>
      <Link to="/admin/moderation">
        <Button
          variant="ghost"
          className={`w-full justify-start ${location.pathname === "/admin/moderation" ? "bg-gray-100" : ""}`}
          size="lg"
        >
          <Shield className="mr-2 h-5 w-5" />
          Modération
        </Button>
      </Link>
      <Link to="/admin/analytics">
        <Button
          variant="ghost"
          className={`w-full justify-start ${location.pathname === "/admin/analytics" ? "bg-gray-100" : ""}`}
          size="lg"
        >
          <BarChart className="mr-2 h-5 w-5" />
          Statistiques
        </Button>
      </Link>
      <Link to="/admin/settings">
        <Button
          variant="ghost"
          className={`w-full justify-start ${location.pathname === "/admin/settings" ? "bg-gray-100" : ""}`}
          size="lg"
        >
          <Settings className="mr-2 h-5 w-5" />
          Paramètres
        </Button>
      </Link>
      <Link to="/admin/doctors">
        <Button
          variant="ghost"
          className={`w-full justify-start ${location.pathname === "/admin/doctors" ? "bg-gray-100" : ""}`}
          size="lg"
        >
          <UserCheck className="mr-2 h-5 w-5" />
          Gestion des médecins
        </Button>
      </Link>
    </div>
  );
};

export default AdminSidebar;
