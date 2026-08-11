
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
  medical_history: {
    chronic_diseases: string[];
    medical_background: string[];
    current_treatments: string[];
  };
  beneficiaries: Array<{
    name: string;
    relationship: string;
    birth_date: string;
  }>;
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
    allergies: [],
    medical_history: {
      chronic_diseases: [],
      medical_background: [],
      current_treatments: []
    },
    beneficiaries: []
  });

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
          .select('birth_date, gender, blood_type, allergies, medical_history, beneficiaries, phone_number')
          .eq('id', user.id)
          .single();

        if (patientError) {
          console.error('Erreur lors du chargement des données patient:', patientError);
        } else if (patientData) {
          const medicalHistory = (patientData.medical_history as any) || {
            chronic_diseases: [],
            medical_background: [],
            current_treatments: []
          };
          const beneficiaries = (patientData.beneficiaries as any) || [];
          
          setPatientInfo({
            ...patientData,
            medical_history: medicalHistory,
            beneficiaries: beneficiaries
          });
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
          allergies: patientInfo.allergies || [],
          medical_history: patientInfo.medical_history,
          beneficiaries: patientInfo.beneficiaries
        });

      if (patientError) throw patientError;

      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde du profil");
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
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium">Historique médical</h4>
            <div className="space-y-2">
              <Label htmlFor="chronic_diseases">Maladies chroniques (séparées par des virgules)</Label>
              <Input 
                id="chronic_diseases" 
                value={patientInfo.medical_history.chronic_diseases?.join(", ") || ""}
                onChange={(e) => setPatientInfo({
                  ...patientInfo,
                  medical_history: {
                    ...patientInfo.medical_history,
                    chronic_diseases: e.target.value.split(",").map(d => d.trim()).filter(d => d)
                  }
                })}
                placeholder="Diabète, Hypertension, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical_background">Antécédents médicaux (séparés par des virgules)</Label>
              <Input 
                id="medical_background" 
                value={patientInfo.medical_history.medical_background?.join(", ") || ""}
                onChange={(e) => setPatientInfo({
                  ...patientInfo,
                  medical_history: {
                    ...patientInfo.medical_history,
                    medical_background: e.target.value.split(",").map(m => m.trim()).filter(m => m)
                  }
                })}
                placeholder="Chirurgies passées, hospitalisations, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_treatments">Traitements en cours (séparés par des virgules)</Label>
              <Input 
                id="current_treatments" 
                value={patientInfo.medical_history.current_treatments?.join(", ") || ""}
                onChange={(e) => setPatientInfo({
                  ...patientInfo,
                  medical_history: {
                    ...patientInfo.medical_history,
                    current_treatments: e.target.value.split(",").map(t => t.trim()).filter(t => t)
                  }
                })}
                placeholder="Médicaments actuels, etc."
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile}>Sauvegarder les modifications</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
