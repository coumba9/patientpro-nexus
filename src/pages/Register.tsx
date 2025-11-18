
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

  const [documents, setDocuments] = useState<{
    diploma: File | null;
    license: File | null;
    others: File[];
  }>({
    diploma: null,
    license: null,
    others: []
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

      // For doctors, create an application instead of registering directly
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        
        // Upload documents first
        let diplomaUrl = null;
        let licenseUrl = null;
        let otherUrls: string[] = [];

        if (documents.diploma) {
          const diplomaPath = `${formData.email}/diploma-${Date.now()}.${documents.diploma.name.split('.').pop()}`;
          const { error: diplomaError } = await supabase.storage
            .from('doctor-documents')
            .upload(diplomaPath, documents.diploma);
          
          if (!diplomaError) {
            diplomaUrl = diplomaPath;
          }
        }

        if (documents.license) {
          const licensePath = `${formData.email}/license-${Date.now()}.${documents.license.name.split('.').pop()}`;
          const { error: licenseError } = await supabase.storage
            .from('doctor-documents')
            .upload(licensePath, documents.license);
          
          if (!licenseError) {
            licenseUrl = licensePath;
          }
        }

        for (const file of documents.others) {
          const otherPath = `${formData.email}/other-${Date.now()}-${file.name}`;
          const { error: otherError } = await supabase.storage
            .from('doctor-documents')
            .upload(otherPath, file);
          
          if (!otherError) {
            otherUrls.push(otherPath);
          }
        }

        const { error } = await supabase
          .from('doctor_applications')
          .insert({
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            specialty_id: formData.speciality,
            license_number: formData.licenseNumber,
            years_of_experience: parseInt(formData.yearsOfExperience),
            diploma_url: diplomaUrl,
            license_url: licenseUrl,
            other_documents_urls: otherUrls.length > 0 ? otherUrls : null
          });

        if (error) {
          if (error.message?.includes("duplicate key")) {
            toast.error("Une demande avec cette adresse email existe déjà");
          } else {
            throw error;
          }
          return;
        }

        toast.success("Votre demande d'inscription a été envoyée avec succès ! Un administrateur va l'examiner et vous recevrez un email une fois qu'elle sera traitée.");
        navigate("/login");
      } catch (error: any) {
        console.error("Application submission error:", error);
        toast.error("Erreur lors de l'envoi de votre demande. Veuillez réessayer.");
      }
      return;
    }

    // For patients, proceed with normal registration
    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.userType,
        specialty_id: null,
        license_number: null,
        years_of_experience: null
      });
      
      toast.success("Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.");
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (type: 'diploma' | 'license' | 'others', files: FileList | null) => {
    if (!files) return;

    if (type === 'others') {
      setDocuments(prev => ({
        ...prev,
        others: [...prev.others, ...Array.from(files)]
      }));
    } else {
      setDocuments(prev => ({
        ...prev,
        [type]: files[0]
      }));
    }
  };

  const removeFile = (type: 'diploma' | 'license' | 'others', index?: number) => {
    if (type === 'diploma' || type === 'license') {
      setDocuments(prev => ({ ...prev, [type]: null }));
    } else if (type === 'others' && index !== undefined) {
      setDocuments(prev => ({
        ...prev,
        others: prev.others.filter((_, i) => i !== index)
      }));
    }
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
          documents={documents}
          handleFileChange={handleFileChange}
          removeFile={removeFile}
        />
      </div>
    </div>
  );
};

export default Register;
