
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DoctorFieldsProps {
  formData: {
    speciality?: string;
    licenseNumber?: string;
    yearsOfExperience?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DoctorFields = ({ formData, handleChange }: DoctorFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="speciality">Spécialité</Label>
        <Input
          id="speciality"
          name="speciality"
          type="text"
          value={formData.speciality}
          onChange={handleChange}
          required
        />
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
