
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Bell,
  Lock,
  Shield,
  Mail,
  Phone,
  MapPin,
  Save,
  Video,
  Clock,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DoctorSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  speciality: string;
  consultationDuration: string;
  notifications: {
    email: boolean;
    sms: boolean;
    appointmentReminders: boolean;
  };
  teleconsultation: {
    enabled: boolean;
    automaticReminders: boolean;
    recordSession: boolean;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<DoctorSettings>({
    firstName: "Thomas",
    lastName: "Martin",
    email: "dr.martin@email.com",
    phone: "06 12 34 56 78",
    address: "123 rue de la Médecine, 75001 Paris",
    speciality: "Médecine générale",
    consultationDuration: "20",
    notifications: {
      email: true,
      sms: true,
      appointmentReminders: true,
    },
    teleconsultation: {
      enabled: true,
      automaticReminders: true,
      recordSession: false,
    },
  });

  const handleSaveSettings = () => {
    toast.success("Paramètres enregistrés avec succès");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    toast.success("Déconnexion réussie");
    navigate("/login");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Paramètres</h2>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      <div className="space-y-6">
        {/* Informations personnelles */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Informations professionnelles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={settings.firstName}
                onChange={(e) =>
                  setSettings({ ...settings, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={settings.lastName}
                onChange={(e) =>
                  setSettings({ ...settings, lastName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speciality">Spécialité</Label>
              <Input
                id="speciality"
                value={settings.speciality}
                onChange={(e) =>
                  setSettings({ ...settings, speciality: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultationDuration">Durée de consultation (min)</Label>
              <Input
                id="consultationDuration"
                type="number"
                value={settings.consultationDuration}
                onChange={(e) =>
                  setSettings({ ...settings, consultationDuration: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </div>
              </Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse du cabinet
                </div>
              </Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notifications par email</Label>
                <p className="text-sm text-gray-500">
                  Recevoir les rappels de rendez-vous par email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">Notifications par SMS</Label>
                <p className="text-sm text-gray-500">
                  Recevoir les rappels de rendez-vous par SMS
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.notifications.sms}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, sms: checked },
                  })
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Téléconsultation */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Téléconsultation</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="teleconsultation-enabled">Activer la téléconsultation</Label>
                <p className="text-sm text-gray-500">
                  Permettre aux patients de prendre des rendez-vous en téléconsultation
                </p>
              </div>
              <Switch
                id="teleconsultation-enabled"
                checked={settings.teleconsultation.enabled}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    teleconsultation: { ...settings.teleconsultation, enabled: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="automatic-reminders">Rappels automatiques</Label>
                <p className="text-sm text-gray-500">
                  Envoyer des rappels automatiques avant la téléconsultation
                </p>
              </div>
              <Switch
                id="automatic-reminders"
                checked={settings.teleconsultation.automaticReminders}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    teleconsultation: {
                      ...settings.teleconsultation,
                      automaticReminders: checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Sécurité */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Sécurité</h3>
          </div>
          <div className="space-y-4">
            <Button variant="outline" className="w-full sm:w-auto">
              <Lock className="h-4 w-4 mr-2" />
              Changer le mot de passe
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end gap-4">
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
