
import { useState } from "react";
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
} from "lucide-react";

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notifications: {
    email: boolean;
    sms: boolean;
    reminders: boolean;
  };
}

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@email.com",
    phone: "06 12 34 56 78",
    address: "123 rue de Paris, 75001 Paris",
    notifications: {
      email: true,
      sms: true,
      reminders: true,
    },
  });

  const handleSaveSettings = () => {
    toast.success("Paramètres enregistrés avec succès");
  };

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Paramètres</h2>

      <div className="space-y-6">
        {/* Informations personnelles */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Informations personnelles</h3>
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
                  Adresse
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
                onCheckedChange={() => handleNotificationChange("email")}
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
                onCheckedChange={() => handleNotificationChange("sms")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-notifications">Rappels automatiques</Label>
                <p className="text-sm text-gray-500">
                  Recevoir des rappels avant les rendez-vous
                </p>
              </div>
              <Switch
                id="reminder-notifications"
                checked={settings.notifications.reminders}
                onCheckedChange={() => handleNotificationChange("reminders")}
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

        <div className="flex justify-end">
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
