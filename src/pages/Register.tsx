
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { RegisterForm } from "@/components/register/RegisterForm";

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
    speciality: "",
    licenseNumber: "",
    yearsOfExperience: "",
  });

  useEffect(() => {
    if (isDoctor) {
      setFormData((prev) => ({ ...prev, userType: "doctor" }));
    }
  }, [isDoctor]);

  const handleSubmit = (e: React.FormEvent) => {
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

    console.log("Register attempt:", formData);
    if (isDoctor) {
      toast.success("Votre demande d'inscription a été envoyée et sera examinée par notre équipe");
    } else {
      toast.success("Inscription réussie");
    }
    navigate("/login");
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
