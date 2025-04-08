
import { Button } from "@/components/ui/button";
import { LogIn, Search, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Hero = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Utilisation d'une fonction pour vérifier l'état de connexion
    const checkLoginStatus = () => {
      const status = localStorage.getItem("isLoggedIn") === "true";
      const role = localStorage.getItem("userRole");
      console.log("Hero component - checking login status:", status, "role:", role);
      setIsLoggedIn(status);
      setUserRole(role);
    };
    
    // Vérifier au chargement
    checkLoginStatus();
    
    // Configurer un événement pour détecter les changements de localStorage
    window.addEventListener('storage', checkLoginStatus);
    
    // Nettoyage
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleBookAppointment = () => {
    // Si connecté en tant que médecin, afficher un message d'erreur
    if (isLoggedIn && userRole === "doctor") {
      navigate("/doctor");
      return;
    }
    // Sinon, naviguer vers la page "Trouver un médecin"
    navigate("/find-doctor");
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sky-100 to-white py-20 md:py-32 px-4 md:px-6">
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              {isLoggedIn && userRole === "doctor" 
                ? "Bienvenue dans votre espace médecin" 
                : "Votre santé, notre priorité"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 mb-8"
            >
              {isLoggedIn && userRole === "doctor"
                ? "Gérez vos rendez-vous, vos patients et vos consultations en toute simplicité"
                : "Prenez rendez-vous avec les meilleurs professionnels de santé, 24h/24 et 7j/7 sur MediConnect"}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {!(isLoggedIn && userRole === "doctor") && (
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all" onClick={handleBookAppointment}>
                  <Search className="mr-2 h-5 w-5" />
                  Trouver un médecin
                </Button>
              )}
              
              {!isLoggedIn && (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-gray-50">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Je suis patient
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all">
                      <LogIn className="mr-2 h-5 w-5" />
                      Connexion
                    </Button>
                  </Link>
                </>
              )}
              
              {isLoggedIn && userRole === "patient" && (
                <Link to="/patient" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all">
                    Mon espace patient
                  </Button>
                </Link>
              )}

              {isLoggedIn && userRole === "doctor" && (
                <Link to="/doctor" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all">
                    Mon espace médecin
                  </Button>
                </Link>
              )}
            </motion.div>
            {!(isLoggedIn && userRole === "doctor") && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-6"
              >
                <Link to="/register?type=doctor" className="text-primary hover:text-primary/90 font-medium underline-offset-4 hover:underline">
                  Vous êtes médecin ? Rejoignez-nous
                </Link>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-400 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <img 
                  src="/placeholder.svg" 
                  alt="MediConnect" 
                  className="w-full h-auto object-cover aspect-square"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg">
                  <svg xmlns="https://unsplash.com/fr/photos/un-livre-avec-un-stethoscope-par-dessus-OjlYsOIq-TQ" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line></svg>
                  97% de satisfaction
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
