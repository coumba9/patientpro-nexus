
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  BarChart,
  Settings,
  Bell,
  Mail,
  Lock,
  Globe,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminSettings = () => {
  const handleSaveSettings = () => {
    toast.success("Paramètres sauvegardés avec succès");
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
            <Link to="/admin/doctors">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <UserCheck className="mr-2 h-5 w-5" />
                Gestion des médecins
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Paramètres du système</h2>

              <div className="space-y-6">
                {/* Notifications */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifications par email</Label>
                        <p className="text-sm text-gray-500">
                          Recevoir des notifications pour les nouveaux signalements
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifications push</Label>
                        <p className="text-sm text-gray-500">
                          Activer les notifications push dans le navigateur
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                {/* Sécurité */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Sécurité
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Double authentification</Label>
                        <p className="text-sm text-gray-500">
                          Renforcer la sécurité du compte administrateur
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Journal d'activité</Label>
                        <p className="text-sm text-gray-500">
                          Enregistrer toutes les actions administratives
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Système */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Système
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mode maintenance</Label>
                        <p className="text-sm text-gray-500">
                          Activer le mode maintenance du site
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Inscriptions</Label>
                        <p className="text-sm text-gray-500">
                          Autoriser les nouvelles inscriptions
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings}>
                    Sauvegarder les paramètres
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
