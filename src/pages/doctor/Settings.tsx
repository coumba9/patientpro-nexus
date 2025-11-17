
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { LogOut, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DoctorPersonalInfo } from "@/components/settings/DoctorPersonalInfo";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { TeleconsultationSettings } from "@/components/settings/TeleconsultationSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { AvailabilitySettings } from "@/components/settings/AvailabilitySettings";
import { LocationSettings } from "@/components/doctor/LocationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientRecord } from "@/components/doctor/PatientRecord";

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<DoctorSettings>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    speciality: "",
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

  useEffect(() => {
    const loadDoctorSettings = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select(`
            *,
            specialty:specialty_id (name)
          `)
          .eq('id', user.id)
          .single();

        if (doctorError) throw doctorError;

        setSettings({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          phone: "",
          address: "",
          speciality: doctor.specialty?.name || "",
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
      } catch (error) {
        console.error('Error loading doctor settings:', error);
        toast.error("Erreur lors du chargement des paramètres");
      } finally {
        setLoading(false);
      }
    };

    loadDoctorSettings();
  }, [user]);

  const handleSaveSettings = () => {
    toast.success("Paramètres enregistrés avec succès");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    toast.success("Déconnexion réussie");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p>Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Paramètres</h2>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="availability">Disponibilités</TabsTrigger>
          <TabsTrigger value="patients">Dossiers patients</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
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
            
            <LocationSettings />
            
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
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilitySettings />
          
          <Separator className="my-6" />
          
          <div className="flex justify-end gap-4">
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="patients">
          <PatientRecord />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
