
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { RegisterForm } from "@/components/register/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import { Home, UserPlus, Stethoscope, Shield, Clock, Users, CheckCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

      try {
        const { supabase } = await import("@/integrations/supabase/client");
        
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

  const patientFeatures = [
    { icon: Clock, text: "Prise de rendez-vous en ligne 24h/24" },
    { icon: Users, text: "Accès à des médecins qualifiés" },
    { icon: Shield, text: "Données médicales sécurisées" },
    { icon: Heart, text: "Suivi personnalisé de votre santé" },
  ];

  const doctorFeatures = [
    { icon: Users, text: "Gérez facilement vos patients" },
    { icon: Clock, text: "Optimisez votre emploi du temps" },
    { icon: Shield, text: "Plateforme sécurisée et certifiée" },
    { icon: CheckCircle, text: "Validation après vérification" },
  ];

  const features = isDoctor ? doctorFeatures : patientFeatures;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          {/* Animated Circles */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" 
          />
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute bottom-32 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" 
          />
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl" 
          />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Medical Icons */}
          <motion.div 
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 0.2 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute top-16 right-20"
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="white">
              <rect x="35" y="10" width="10" height="60" rx="2" />
              <rect x="10" y="35" width="60" height="10" rx="2" />
            </svg>
          </motion.div>
          <motion.div 
            initial={{ rotate: 45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 0.15 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute bottom-20 left-16"
          >
            <svg width="60" height="60" viewBox="0 0 60 60" fill="white">
              <rect x="25" y="5" width="10" height="50" rx="2" />
              <rect x="5" y="25" width="50" height="10" rx="2" />
            </svg>
          </motion.div>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="absolute top-1/3 right-1/4"
          >
            <svg width="100" height="100" viewBox="0 0 100 100" fill="white">
              <rect x="42" y="10" width="16" height="80" rx="3" />
              <rect x="10" y="42" width="80" height="16" rx="3" />
            </svg>
          </motion.div>

          {/* Floating Shapes */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute top-1/4 left-10 w-4 h-4 bg-white/30 rounded-full" 
          />
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute top-2/3 right-1/4 w-6 h-6 bg-white/20 rounded-full" 
          />
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-white/40 rounded-full" 
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              {isDoctor ? (
                <Stethoscope className="w-12 h-12" />
              ) : (
                <UserPlus className="w-12 h-12" />
              )}
              <span className="text-3xl font-bold">JàmmSanté</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              {isDoctor ? "Rejoignez notre réseau médical" : "Créez votre compte patient"}
            </h1>
            <p className="text-lg xl:text-xl text-white/80 leading-relaxed">
              {isDoctor 
                ? "Développez votre patientèle et gérez vos consultations en toute simplicité avec JàmmSanté."
                : "Accédez à des soins de qualité et gérez votre santé en toute simplicité avec JàmmSanté."
              }
            </p>
          </motion.div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-lg">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-10 grid grid-cols-3 gap-6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-white/70 text-sm">Médecins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-white/70 text-sm">Patients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-white/70 text-sm">Satisfaction</div>
            </div>
          </motion.div>

          {/* Switch registration type */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
          >
            <p className="text-white/80 mb-3">
              {isDoctor ? "Vous êtes un patient ?" : "Vous êtes médecin ?"}
            </p>
            <Button
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              asChild
            >
              <Link to={isDoctor ? "/register" : "/register?type=doctor"}>
                {isDoctor ? "Inscription Patient" : "Inscription Médecin"}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between p-4 lg:p-6"
        >
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <Home className="w-5 h-5" />
            </Link>
          </Button>
          
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            {isDoctor ? (
              <Stethoscope className="w-6 h-6 text-primary" />
            ) : (
              <Heart className="w-6 h-6 text-primary" />
            )}
            <span className="font-bold text-primary">JàmmSanté</span>
          </div>

          <div className="w-10" /> {/* Spacer for balance */}
        </motion.div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md"
          >

            {/* Title */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                {isDoctor ? (
                  <Stethoscope className="w-8 h-8 text-primary" />
                ) : (
                  <UserPlus className="w-8 h-8 text-primary" />
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isDoctor ? "Inscription Médecin" : "Créer un compte"}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {isDoctor 
                  ? "Remplissez le formulaire pour rejoindre notre réseau"
                  : "Rejoignez JàmmSanté pour accéder à nos services"
                }
              </p>
            </motion.div>

            {/* Form Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8"
            >
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
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>SSL Sécurisé</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Conforme RGPD</span>
              </div>
            </motion.div>

            {/* Mobile registration type switcher - Moved to bottom */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="lg:hidden mt-6 p-4 bg-muted/50 rounded-xl text-center"
            >
              <p className="text-muted-foreground text-sm mb-3">
                {isDoctor ? "Vous êtes un patient ?" : "Vous êtes médecin ?"}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to={isDoctor ? "/register" : "/register?type=doctor"}>
                  {isDoctor ? "Inscription Patient" : "Inscription Médecin"}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
