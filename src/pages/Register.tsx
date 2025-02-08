
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDoctor = searchParams.get("type") === "doctor";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "patient",
    // Champs spécifiques aux médecins
    speciality: "",
    licenseNumber: "",
    yearsOfExperience: "",
  });

  useEffect(() => {
    if (isDoctor) {
      setFormData(prev => ({ ...prev, userType: "doctor" }));
    }
  }, [isDoctor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    // Validation supplémentaire pour les médecins
    if (isDoctor) {
      if (!formData.speciality || !formData.licenseNumber || !formData.yearsOfExperience) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      // Simuler la vérification du numéro de licence
      if (formData.licenseNumber.length < 6) {
        toast.error("Le numéro de licence doit contenir au moins 6 caractères");
        return;
      }
    }

    // Simuler une inscription réussie
    console.log("Register attempt:", formData);
    if (isDoctor) {
      toast.success("Votre demande d'inscription a été envoyée et sera examinée par notre équipe");
    } else {
      toast.success("Inscription réussie");
    }
    // Rediriger vers la page de connexion
    navigate("/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isDoctor ? "Inscription Médecin" : "Créer un compte"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link to="/login" className="text-primary hover:text-primary/90">
              connectez-vous à votre compte
            </Link>
          </p>
        </div>

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

            {!isDoctor && (
              <input
                type="hidden"
                name="userType"
                value="patient"
              />
            )}
          </div>

          <Button type="submit" className="w-full">
            {isDoctor ? "Envoyer la demande d'inscription" : "S'inscrire"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
