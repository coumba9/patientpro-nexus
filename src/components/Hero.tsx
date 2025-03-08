
import { Button } from "@/components/ui/button";
import { LogIn, Search, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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
    // Naviguer directement vers la page "Trouver un médecin" sans vérification de connexion
    navigate("/find-doctor");
  };

  return (
    <div className="relative bg-gradient-to-b from-sky-50 to-white py-32 px-6">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Trouvez votre médecin en quelques clics
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Prenez rendez-vous avec les meilleurs professionnels de santé, 24h/24 et
          7j/7
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="w-full sm:w-auto" onClick={handleBookAppointment}>
            <Search className="mr-2 h-5 w-5" />
            Trouver un médecin
          </Button>
          
          {!isLoggedIn && (
            <>
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Je suis patient
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <LogIn className="mr-2 h-5 w-5" />
                  Connexion
                </Button>
              </Link>
            </>
          )}
          
          {isLoggedIn && userRole === "patient" && (
            <Link to="/patient">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Mon espace patient
              </Button>
            </Link>
          )}

          {isLoggedIn && userRole === "doctor" && (
            <Link to="/doctor">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Mon espace médecin
              </Button>
            </Link>
          )}
        </div>
        <div className="mt-4">
          <Link to="/register?type=doctor" className="text-primary hover:text-primary/90">
            Vous êtes médecin ? Rejoignez-nous
          </Link>
        </div>
      </div>
    </div>
  );
}
