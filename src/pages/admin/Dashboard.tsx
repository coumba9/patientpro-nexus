
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  BarChart,
  Settings,
  UserCheck,
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  FileText,
  GraduationCap,
  MapPin,
  Calendar,
  Phone,
  Mail,
  LogOut,
  Home,
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
      
      if (openDialog) {
        setOpenDialog(false);
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Erreur lors de la validation");
    }
  };

  const handleRejectDoctor = async (applicationId: string) => {
    try {
      const { error } = await supabase.functions.invoke("reject-doctor-application", {
        body: { 
          applicationId,
          rejectionReason: "Dossier incomplet ou non conforme"
        },
      });

      if (error) throw error;
      
      toast.success("Le compte médecin a été rejeté");
      
      if (openDialog) {
        setOpenDialog(false);
      }
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Erreur lors du rejet");
    }
  };

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setOpenDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-900 py-4 border-b dark:border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              JàmmSanté
            </Link>
            <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Admin</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
            <h2 className="font-semibold text-lg mb-4">Administration</h2>
            <Link to="/admin">
              <Button
                variant="ghost"
                className="w-full justify-start bg-gray-100"
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Utilisateurs
              </Button>
            </Link>
            <Link to="/admin/moderation">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Shield className="mr-2 h-5 w-5" />
                Modération
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <BarChart className="mr-2 h-5 w-5" />
                Statistiques
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Settings className="mr-2 h-5 w-5" />
                Paramètres
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Comptes à valider</h3>
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{applications.length}</p>
                <p className="text-gray-600">médecins en attente</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Signalements</h3>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-3xl font-bold">3</p>
                <p className="text-gray-600">à traiter</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Comptes bloqués</h3>
                  <Ban className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold">1</p>
                <p className="text-gray-600">utilisateurs</p>
              </div>
            </div>

            {/* Validation des médecins */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">
                Médecins en attente de validation
              </h2>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : applications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune demande en attente</p>
                ) : (
                  applications.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-semibold">{doctor.first_name} {doctor.last_name}</h3>
                      <p className="text-gray-600">{doctor.specialty_name}</p>
                      <p className="text-sm text-gray-500">
                        Inscrit le {new Date(doctor.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center"
                        onClick={() => handleViewDetails(doctor)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Voir le dossier
                      </Button>
                      <Button 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRejectDoctor(doctor.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Refuser
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
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
            </div>

            {/* Statistiques récentes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Statistiques récentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Nouveaux utilisateurs</h3>
                  <p className="text-2xl font-bold">127</p>
                  <p className="text-sm text-green-600">+12% cette semaine</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Téléconsultations</h3>
                  <p className="text-2xl font-bold">284</p>
                  <p className="text-sm text-green-600">+8% cette semaine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog pour afficher les détails du médecin */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Dossier du médecin
            </DialogTitle>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-4 mt-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <UserCheck className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold">{selectedDoctor.name}</h2>
                <p className="text-primary font-medium">{selectedDoctor.specialty}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{selectedDoctor.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                    <p>{selectedDoctor.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Adresse</p>
                    <p>{selectedDoctor.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date d'inscription</p>
                    <p>{selectedDoctor.registrationDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-start gap-3 mb-4">
                  <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Formation</p>
                    <p>{selectedDoctor.education}</p>
                    <p className="mt-1"><span className="font-medium">Expérience:</span> {selectedDoctor.experience}</p>
                  </div>
                </div>
                
                <p className="text-sm font-medium text-gray-500 mb-2">Certifications</p>
                <ul className="list-disc pl-5 mb-4">
                  {selectedDoctor.certifications.map((cert, index) => (
                    <li key={index} className="text-sm mb-1">{cert}</li>
                  ))}
                </ul>
                
                <p className="text-sm font-medium text-gray-500 mb-2">À propos</p>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedDoctor.about}</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Fermer
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleRejectDoctor(selectedDoctor.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Refuser
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
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
    </div>
  );
};

export default AdminDashboard;
