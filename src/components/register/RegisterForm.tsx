
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { DoctorFields } from "./DoctorFields";

interface RegisterFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    speciality?: string;
    licenseNumber?: string;
    yearsOfExperience?: string;
  };
  isDoctor: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleSelectChange?: (name: string, value: string) => void;
}

export const RegisterForm = ({
  formData,
  isDoctor,
  handleChange,
  handleSubmit,
  handleSelectChange,
}: RegisterFormProps) => {
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {isDoctor && (
          <DoctorFields 
            formData={formData} 
            handleChange={handleChange} 
            handleSelectChange={handleSelectChange}
          />
        )}

        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {isDoctor ? "Envoyer la demande d'inscription" : "S'inscrire"}
      </Button>

      <p className="mt-2 text-center text-sm text-gray-600">
        Déjà un compte ?{" "}
        <Link to="/login" className="text-primary hover:text-primary/90">
          Connectez-vous
        </Link>
      </p>
    </form>
  );
};
