import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  BarChart,
  Settings,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

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
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
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
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">
                Médecins en attente de validation
              </h2>
              <div className="space-y-4">
                {pendingDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">
                        Inscrit le {doctor.registrationDate}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline">Voir le dossier</Button>
                      <Button>Valider</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;