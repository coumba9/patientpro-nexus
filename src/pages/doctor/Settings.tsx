
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { LogOut, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorPersonalInfo } from "@/components/settings/DoctorPersonalInfo";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { TeleconsultationSettings } from "@/components/settings/TeleconsultationSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";

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
  };
  teleconsultation: {
    enabled: boolean;
    automaticReminders: boolean;
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
    },
    teleconsultation: {
      enabled: true,
      automaticReminders: true,
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
        <DoctorPersonalInfo settings={settings} setSettings={setSettings} />
        
        <Separator />
        
        <NotificationSettings 
          notifications={settings.notifications}
          setSettings={setSettings}
        />
        
        <Separator />
        
        <TeleconsultationSettings
          teleconsultation={settings.teleconsultation}
          setSettings={setSettings}
        />
        
        <Separator />
        
        <SecuritySettings />
        
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
