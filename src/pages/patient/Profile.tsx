
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Lock, Shield, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/api/services/auth.service";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
}

interface PatientInfo {
  birth_date: string;
  gender: string;
  blood_type: string;
  allergies: string[];
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    email: ""
  });
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    birth_date: "",
    gender: "",
    blood_type: "",
    allergies: []
  });
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Récupérer les données du profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erreur lors du chargement du profil:', profileError);
        } else if (profileData) {
          setProfile(profileData);
        }

        // Récupérer les données du patient
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('birth_date, gender, blood_type, allergies')
          .eq('id', user.id)
          .single();

        if (patientError) {
          console.error('Erreur lors du chargement des données patient:', patientError);
        } else if (patientData) {
          setPatientInfo(patientData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error("Erreur lors du chargement de vos données");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: patientError } = await supabase
        .from('patients')
        .upsert({
          id: user.id,
          birth_date: patientInfo.birth_date || null,
          gender: patientInfo.gender || null,
          blood_type: patientInfo.blood_type || null,
          allergies: patientInfo.allergies || []
        });

      if (patientError) throw patientError;

      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde du profil");
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Veuillez saisir votre adresse email");
      return;
    }

    try {
      await authService.resetPassword(resetEmail);
      toast.success("Instructions de réinitialisation envoyées par email");
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error("Erreur lors de l'envoi des instructions");
    }
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
      console.error('Erreur lors du changement de mot de passe:', error);
      toast.error("Erreur lors du changement de mot de passe");
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input 
                id="firstName" 
                value={profile.first_name} 
                onChange={(e) => setProfile({...profile, first_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input 
                id="lastName" 
                value={profile.last_name}
                onChange={(e) => setProfile({...profile, last_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdate">Date de naissance</Label>
              <Input 
                id="birthdate" 
                type="date" 
                value={patientInfo.birth_date}
                onChange={(e) => setPatientInfo({...patientInfo, birth_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Sexe</Label>
              <Select
                value={patientInfo.gender}
                onValueChange={(value) =>
                  setPatientInfo({ ...patientInfo, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculin">Masculin</SelectItem>
                  <SelectItem value="Féminin">Féminin</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">Groupe sanguin</Label>
              <Input 
                id="bloodType" 
                value={patientInfo.blood_type}
                onChange={(e) => setPatientInfo({...patientInfo, blood_type: e.target.value})}
                placeholder="A+, B-, O+, etc."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (séparées par des virgules)</Label>
            <Input 
              id="allergies" 
              value={patientInfo.allergies?.join(", ") || ""}
              onChange={(e) => setPatientInfo({
                ...patientInfo, 
                allergies: e.target.value.split(",").map(a => a.trim()).filter(a => a)
              })}
              placeholder="Pénicilline, Arachides, etc."
            />
          </div>
          <Button onClick={handleSaveProfile}>Sauvegarder les modifications</Button>
        </CardContent>
      </Card>

      {/* Section Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
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
                    <Input 
                      id="newPassword"
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input 
                      id="confirmPassword"
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleChangePassword} className="w-full">
                    Modifier le mot de passe
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full sm:w-auto">
                  Mot de passe oublié ?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Saisissez votre adresse email pour recevoir les instructions de réinitialisation.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Adresse email</Label>
                    <Input 
                      id="resetEmail"
                      type="email" 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                  <Button onClick={handleResetPassword} className="w-full">
                    Envoyer les instructions
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
