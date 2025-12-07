import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar,
  Users,
  MessageCircle,
  FileText,
  Settings,
  Video,
  LogOut,
  Home,
  ArrowLeft,
  Stethoscope,
} from "lucide-react";

export const DoctorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ||
      (path !== "/doctor" && location.pathname.startsWith(path));
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const menuItems = [
    { to: "/doctor", icon: Calendar, label: "Agenda", exact: true },
    { to: "/doctor/patients", icon: Users, label: "Patients" },
    { to: "/doctor/teleconsultation", icon: Video, label: "Téléconsultation" },
    { to: "/doctor/messages", icon: MessageCircle, label: "Messages" },
    { to: "/doctor/documents", icon: FileText, label: "Documents" },
    { to: "/doctor/settings", icon: Settings, label: "Paramètres" },
  ];

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5 space-y-1.5 sticky top-24">
      <div className="flex items-center gap-3 px-3 pb-4 mb-2 border-b border-border/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
          <Stethoscope className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-bold text-foreground">Espace Médecin</h2>
          <p className="text-xs text-muted-foreground">Gérez vos consultations</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex-1 justify-center rounded-xl border-border/50 hover:bg-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border/50 hover:bg-accent"
          >
            <Home className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const active = item.exact
            ? location.pathname === item.to
            : isActive(item.to);

          return (
            <Link key={item.to} to={item.to}>
              <Button
                variant="ghost"
                className={`w-full justify-start rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-accent text-primary font-medium shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                size="lg"
              >
                <item.icon className={`mr-3 h-5 w-5 ${active ? "text-primary" : ""}`} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 mt-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};
