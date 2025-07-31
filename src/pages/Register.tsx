
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { RegisterForm } from "@/components/register/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDoctor = searchParams.get("type") === "doctor";
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "patient",
    speciality: "",
    licenseNumber: "",
    yearsOfExperience: "",
  });

  useEffect(() => {
    if (isDoctor) {
      setFormData((prev) => ({ ...prev, userType: "doctor" }));
    }
  }, [isDoctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (isDoctor) {
      if (!formData.speciality || !formData.licenseNumber || !formData.yearsOfExperience) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      if (formData.licenseNumber.length < 6) {
        toast.error("Le numéro de licence doit contenir au moins 6 caractères");
        return;
      }
    }

    try {
      const { register } = useAuth();
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.userType,
        specialty_id: formData.speciality || null,
        license_number: formData.licenseNumber || null,
        years_of_experience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null
      });
      
      if (isDoctor) {
        toast.success("Votre demande d'inscription a été envoyée. Veuillez vérifier votre email pour confirmer votre compte.");
      } else {
        toast.success("Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.");
      }
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.message?.includes("User already registered")) {
        toast.error("Un compte avec cette adresse email existe déjà");
      } else if (error.message?.includes("Password should be at least 6 characters")) {
        toast.error("Le mot de passe doit contenir au moins 6 caractères");
      } else {
        toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isDoctor ? "Inscription Médecin" : "Créer un compte"}
          </h2>
        </div>

        <RegisterForm
          formData={formData}
          isDoctor={isDoctor}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleSelectChange={handleSelectChange}
        />
      </div>
    </div>
  );
};

export default Register;
