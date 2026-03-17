
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/api/services/auth.service";
import {
  User,
  Bell,
  Lock,
  Shield,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
} from "lucide-react";

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  allergies: string;
  notifications: {
    email: boolean;
    sms: boolean;
    reminders: boolean;
  };
}

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: "",
    bloodType: "",
    allergies: "",
    notifications: {
      email: true,
      sms: true,
      reminders: true,
    },
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erreur lors du chargement du profil:', profileError);
          toast.error('Erreur lors du chargement du profil');
          return;
        }

        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .single();

        if (patientError && patientError.code !== 'PGRST116') {
          console.error('Erreur lors du chargement des données patient:', patientError);
        }

        // Load notification preferences
        const { data: notifPrefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setSettings({
          firstName: profile?.first_name || "",
          lastName: profile?.last_name || "",
          email: profile?.email || user.email || "",
          phone: profile?.phone_number || "",
          address: profile?.address || "",
          birthDate: patient?.birth_date || "",
          gender: patient?.gender || "",
          bloodType: patient?.blood_type || "",
          allergies: patient?.allergies ? patient.allergies.join(", ") : "",
          notifications: {
            email: notifPrefs?.email_notifications ?? true,
            sms: notifPrefs?.sms_notifications ?? true,
            reminders: notifPrefs?.reminder_notifications ?? true,
          },
        });
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      // Update profile (including phone and address)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: settings.firstName,
          last_name: settings.lastName,
          email: settings.email,
          phone_number: settings.phone || null,
          address: settings.address || null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update patient data
      const { error: patientError } = await supabase
        .from('patients')
        .upsert({
          id: user.id,
          birth_date: settings.birthDate || null,
          gender: settings.gender || null,
          blood_type: settings.bloodType || null,
          allergies: settings.allergies ? settings.allergies.split(",").map(a => a.trim()).filter(a => a) : null,
        });

      if (patientError) throw patientError;

      // Upsert notification preferences
      const { error: notifError } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          email_notifications: settings.notifications.email,
          sms_notifications: settings.notifications.sms,
          reminder_notifications: settings.notifications.reminders,
        });

      if (notifError) throw notifError;

      toast.success("Paramètres enregistrés avec succès");
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde");
    }
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

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    try {
      await authService.updatePassword(newPassword);
      toast.success("Mot de passe modifié avec succès");
      setIsChangePasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du changement de mot de passe");
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Paramètres</h2>

      <div className="space-y-6">
        {/* Informations personnelles */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Informations personnelles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" value={settings.firstName} onChange={(e) => setSettings({ ...settings, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" value={settings.lastName} onChange={(e) => setSettings({ ...settings, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email"><div className="flex items-center gap-2"><Mail className="h-4 w-4" />Email</div></Label>
              <Input id="email" type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone"><div className="flex items-center gap-2"><Phone className="h-4 w-4" />Téléphone</div></Label>
              <Input id="phone" value={settings.phone} placeholder="+221 77 000 00 00" onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input id="birthDate" type="date" value={settings.birthDate} onChange={(e) => setSettings({ ...settings, birthDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Sexe</Label>
              <Input id="gender" value={settings.gender} placeholder="Homme/Femme/Autre" onChange={(e) => setSettings({ ...settings, gender: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">Groupe sanguin</Label>
              <Input id="bloodType" value={settings.bloodType} placeholder="A+, B-, O+, etc." onChange={(e) => setSettings({ ...settings, bloodType: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input id="allergies" value={settings.allergies} placeholder="Séparez par des virgules" onChange={(e) => setSettings({ ...settings, allergies: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address"><div className="flex items-center gap-2"><MapPin className="h-4 w-4" />Adresse</div></Label>
              <Input id="address" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notifications par email</Label>
                <p className="text-sm text-muted-foreground">Recevoir les rappels de rendez-vous par email</p>
              </div>
              <Switch id="email-notifications" checked={settings.notifications.email} onCheckedChange={() => handleNotificationChange("email")} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">Notifications par SMS</Label>
                <p className="text-sm text-muted-foreground">Recevoir les rappels de rendez-vous par SMS</p>
              </div>
              <Switch id="sms-notifications" checked={settings.notifications.sms} onCheckedChange={() => handleNotificationChange("sms")} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-notifications">Rappels automatiques</Label>
                <p className="text-sm text-muted-foreground">Recevoir des rappels avant les rendez-vous</p>
              </div>
              <Switch id="reminder-notifications" checked={settings.notifications.reminders} onCheckedChange={() => handleNotificationChange("reminders")} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Sécurité */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Sécurité</h3>
          </div>
          <div className="space-y-4">
            <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Lock className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Changer le mot de passe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button onClick={handleChangePassword} className="w-full">Modifier le mot de passe</Button>
                </div>
              </DialogContent>
            </Dialog>
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
