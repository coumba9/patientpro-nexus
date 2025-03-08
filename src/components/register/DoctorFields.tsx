
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DoctorFieldsProps {
  formData: {
    speciality?: string;
    licenseNumber?: string;
    yearsOfExperience?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange?: (name: string, value: string) => void;
}

// Liste des spécialités médicales
const SPECIALITIES = [
  "Médecine générale",
  "Cardiologie",
  "Dermatologie",
  "Gastro-entérologie",
  "Gynécologie",
  "Neurologie",
  "Ophtalmologie",
  "ORL",
  "Pédiatrie",
  "Psychiatrie",
  "Radiologie",
  "Rhumatologie",
  "Urologie"
];

export const DoctorFields = ({ formData, handleChange, handleSelectChange }: DoctorFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="speciality">Spécialité</Label>
        <Select 
          name="speciality"
          value={formData.speciality || ""}
          onValueChange={(value) => handleSelectChange && handleSelectChange("speciality", value)}
        >
          <SelectTrigger id="speciality">
            <SelectValue placeholder="Sélectionnez votre spécialité" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALITIES.map((speciality) => (
              <SelectItem key={speciality} value={speciality}>
                {speciality}
              </SelectItem>
            ))}
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
