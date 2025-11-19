
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DoctorFieldsProps {
  formData: {
    speciality?: string;
    licenseNumber?: string;
    yearsOfExperience?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange?: (name: string, value: string) => void;
}

interface Specialty {
  id: string;
  name: string;
}

export const DoctorFields = ({ formData, handleChange, handleSelectChange }: DoctorFieldsProps) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('specialties')
          .select('id, name')
          .eq('status', 'active')
          .order('name');
        
        if (error) {
          console.error('Error fetching specialties:', error);
          setSpecialties([]);
        } else {
          console.log('Specialties loaded:', data);
          setSpecialties(data || []);
        }
      } catch (error) {
        console.error('Error fetching specialties:', error);
        setSpecialties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
    
    // Set up realtime subscription for specialty changes
    const channel = supabase
      .channel('specialties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'specialties'
        },
        () => {
          fetchSpecialties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return (
    <>
      <div>
        <Label htmlFor="speciality">Spécialité</Label>
        <Select 
          name="speciality"
          value={formData.speciality || ""}
          onValueChange={(value) => {
            console.log('Specialty selected:', value);
            if (handleSelectChange) {
              handleSelectChange("speciality", value);
            }
          }}
          disabled={loading}
        >
          <SelectTrigger id="speciality">
            <SelectValue placeholder={loading ? "Chargement..." : "Sélectionnez votre spécialité"} />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <SelectItem value="loading" disabled>Chargement...</SelectItem>
            ) : specialties.length === 0 ? (
              <SelectItem value="empty" disabled>Aucune spécialité disponible</SelectItem>
            ) : (
              specialties.map((specialty) => (
                <SelectItem key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="licenseNumber">Numéro de licence</Label>
        <Input
          id="licenseNumber"
          name="licenseNumber"
          type="text"
          value={formData.licenseNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="yearsOfExperience">Années d'expérience</Label>
        <Input
          id="yearsOfExperience"
          name="yearsOfExperience"
          type="number"
          min="0"
          value={formData.yearsOfExperience}
          onChange={handleChange}
          required
        />
      </div>
    </>
  );
};
