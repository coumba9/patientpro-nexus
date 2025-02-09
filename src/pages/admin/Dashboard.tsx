
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const pendingDoctors = [
  {
    id: 1,
    name: "Dr. Marie Lambert",
    specialty: "Cardiologue",
    registrationDate: "2024-02-18",
  },
  {
    id: 2,
    name: "Dr. Pierre Dumont",
    specialty: "Pédiatre",
    registrationDate: "2024-02-19",
  },
];

const AdminDashboard = () => {
  const handleValidateDoctor = (doctorId: number) => {
    // Simulation de la validation d'un médecin
    console.log("Validation du médecin:", doctorId);
    toast.success("Le compte médecin a été validé avec succès");
  };

  const handleRejectDoctor = (doctorId: number) => {
    // Simulation du rejet d'un médecin
    console.log("Rejet du médecin:", doctorId);
    toast.error("Le compte médecin a été rejeté");
  };

  const handleViewDetails = (doctorId: number) => {
    // Simulation de l'affichage des détails
    console.log("Affichage des détails du médecin:", doctorId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
            <h2 className="font-semibold text-lg mb-4">Administration</h2>
            <Link to="/admin">
              <Button
                variant="ghost"
                className="w-full justify-start"
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
                <p className="text-3xl font-bold">{pendingDoctors.length}</p>
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
                {pendingDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">
                        Inscrit le {doctor.registrationDate}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => handleViewDetails(doctor.id)}
                      >
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
                ))}
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
    </div>
  );
};

export default AdminDashboard;
