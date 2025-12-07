import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  FileText,
  GraduationCap,
  Calendar,
  Mail,
  LogOut,
  Home,
  Heart,
  Shield,
  Users,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRealDoctorApplications } from "@/hooks/useRealDoctorApplications";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { applications, loading } = useRealDoctorApplications();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

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

  const handleValidateDoctor = async (applicationId: string) => {
    try {
      const { error } = await supabase.functions.invoke("approve-doctor-application", {
        body: { applicationId },
      });
      if (error) throw error;
      toast.success("Le compte médecin a été validé avec succès");
      if (openDialog) setOpenDialog(false);
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Erreur lors de la validation");
    }
  };

  const handleRejectDoctor = async (applicationId: string) => {
    try {
      const { error } = await supabase.functions.invoke("reject-doctor-application", {
        body: { applicationId, rejectionReason: "Dossier incomplet ou non conforme" },
      });
      if (error) throw error;
      toast.success("Le compte médecin a été rejeté");
      if (openDialog) setOpenDialog(false);
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Erreur lors du rejet");
    }
  };

  const handleViewDetails = (doctor: any) => {
    setSelectedDoctor(doctor);
    setOpenDialog(true);
  };

  const statsCards = [
    {
      title: "Comptes à valider",
      value: applications.length,
      subtitle: "médecins en attente",
      icon: UserCheck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Signalements",
      value: 3,
      subtitle: "à traiter",
      icon: AlertTriangle,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Comptes bloqués",
      value: 1,
      subtitle: "utilisateurs",
      icon: Ban,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header professionnel */}
      <header className="glass-strong py-4 sticky top-0 z-50 border-b border-border/50">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">JàmmSanté</span>
            </Link>
            <span className="text-xs font-semibold bg-destructive/10 text-destructive px-3 py-1.5 rounded-full">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="rounded-xl border-border/50 hover:bg-accent"
            >
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Accueil</span>
            </Button>
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

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsCards.map((stat, index) => (
                <Card key={index} className="medical-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-xl ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Doctor Applications */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-xl font-display flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Médecins en attente de validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                  ) : applications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune demande en attente</p>
                  ) : (
                    applications.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="rounded-xl border border-border/50 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-soft transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-foreground">
                              {doctor.first_name} {doctor.last_name}
                            </h3>
                            <p className="text-primary text-sm font-medium">{doctor.specialty_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Inscrit le {new Date(doctor.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl bg-accent/50 hover:bg-accent text-primary"
                            onClick={() => handleViewDetails(doctor)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Voir le dossier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-destructive hover:bg-destructive/10"
                            onClick={() => handleRejectDoctor(doctor.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Refuser
                          </Button>
                          <Button
                            size="sm"
                            className="rounded-xl bg-gradient-primary shadow-soft hover:shadow-medium"
                            onClick={() => handleValidateDoctor(doctor.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Valider
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Statistics */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-xl font-display flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Statistiques récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-accent/30 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Nouveaux utilisateurs</h3>
                    </div>
                    <p className="text-3xl font-display font-bold text-foreground">127</p>
                    <p className="text-sm text-primary font-medium">+12% cette semaine</p>
                  </div>
                  <div className="p-5 rounded-xl bg-accent/30 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Téléconsultations</h3>
                    </div>
                    <p className="text-3xl font-display font-bold text-foreground">284</p>
                    <p className="text-sm text-primary font-medium">+8% cette semaine</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <FileText className="h-5 w-5 text-primary" />
              Dossier du médecin
            </DialogTitle>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-6 mt-4">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mb-3 shadow-soft">
                  <UserCheck className="h-10 w-10 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  {selectedDoctor.first_name} {selectedDoctor.last_name}
                </h2>
                <p className="text-primary font-medium">{selectedDoctor.specialty_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/30">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{selectedDoctor.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/30">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Inscription</p>
                    <p className="text-sm text-foreground">
                      {new Date(selectedDoctor.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/30 col-span-2">
                  <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Expérience</p>
                    <p className="text-sm text-foreground">{selectedDoctor.years_of_experience} ans</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setOpenDialog(false)} className="rounded-xl">
                  Fermer
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl text-destructive hover:bg-destructive/10"
                  onClick={() => handleRejectDoctor(selectedDoctor.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Refuser
                </Button>
                <Button
                  className="rounded-xl bg-gradient-primary shadow-soft"
                  onClick={() => handleValidateDoctor(selectedDoctor.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Valider
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
