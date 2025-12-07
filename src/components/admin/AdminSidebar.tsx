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
  CreditCard,
  ChevronRight,
} from "lucide-react";

export const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const menuSections = [
    {
      title: "Principal",
      items: [
        { to: "/admin", icon: LayoutDashboard, label: "Tableau de bord", exact: true },
      ],
    },
    {
      title: "Utilisateurs",
      items: [
        { to: "/admin/users", icon: Users, label: "Utilisateurs" },
        { to: "/admin/patients", icon: User, label: "Patients" },
        { to: "/admin/doctors", icon: UserCheck, label: "Médecins" },
        { to: "/admin/doctor-applications", icon: UserCheck, label: "Demandes médecins" },
      ],
    },
    {
      title: "Contenu",
      items: [
        { to: "/admin/specialties", icon: Stethoscope, label: "Spécialités" },
        { to: "/admin/moderation", icon: Shield, label: "Modération" },
        { to: "/admin/content", icon: FileText, label: "Pages & FAQ" },
      ],
    },
    {
      title: "Système",
      items: [
        { to: "/admin/analytics", icon: BarChart, label: "Statistiques" },
        { to: "/admin/notifications", icon: Bell, label: "Notifications" },
        { to: "/admin/payments", icon: CreditCard, label: "Paiements" },
        { to: "/admin/settings", icon: Settings, label: "Paramètres" },
      ],
    },
  ];

  return (
    <div className="bg-card min-h-screen w-64 sticky top-0 overflow-y-auto border-r border-border/50 p-5">
      <div className="flex items-center gap-3 px-3 pb-5 mb-4 border-b border-border/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-bold text-foreground">Administration</h2>
          <p className="text-xs text-muted-foreground">Panneau de contrôle</p>
        </div>
      </div>

      <nav className="space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = item.exact
                  ? location.pathname === item.to
                  : isActive(item.to);

                return (
                  <Link key={item.to} to={item.to}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start rounded-xl transition-all duration-200 group ${
                        active
                          ? "bg-accent text-primary font-medium shadow-soft"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                      size="default"
                    >
                      <item.icon className={`mr-3 h-4 w-4 ${active ? "text-primary" : ""}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {active && <ChevronRight className="h-4 w-4 text-primary/50" />}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
