import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Lock, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const SETTINGS_KEY = "admin_system_settings";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: false,
    pushNotifications: false,
    twoFactor: false,
    activityLog: true,
    maintenanceMode: false,
    registrationEnabled: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de la sauvegarde des paramètres");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block w-64 border-r">
        <AdminSidebar />
      </div>
      
      <div className="flex-1 p-8">
        <div className="bg-card rounded-lg shadow-sm p-6">
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
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications pour les nouveaux signalements
                    </p>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les notifications push dans le navigateur
                    </p>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
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
                    <p className="text-sm text-muted-foreground">
                      Renforcer la sécurité du compte administrateur
                    </p>
                  </div>
                  <Switch 
                    checked={settings.twoFactor}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, twoFactor: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Journal d'activité</Label>
                    <p className="text-sm text-muted-foreground">
                      Enregistrer toutes les actions administratives
                    </p>
                  </div>
                  <Switch 
                    checked={settings.activityLog}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, activityLog: checked })
                    }
                  />
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
                    <p className="text-sm text-muted-foreground">
                      Activer le mode maintenance du site
                    </p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, maintenanceMode: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Inscriptions</Label>
                    <p className="text-sm text-muted-foreground">
                      Autoriser les nouvelles inscriptions
                    </p>
                  </div>
                  <Switch 
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, registrationEnabled: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Sauvegarde en cours..." : "Sauvegarder les paramètres"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
