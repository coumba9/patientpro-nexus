
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Statistics } from "@/components/Statistics";
import { Testimonials } from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Heart, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNavigation } from "@/components/MobileNavigation";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const status = localStorage.getItem("isLoggedIn") === "true";
      const role = localStorage.getItem("userRole");
      console.log("Index component - checking login status:", status, "role:", role);
      setIsLoggedIn(status);
      setUserRole(role);
    };
    
    checkLoginStatus();
    
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      if (userRole === "doctor") {
        navigate("/doctor");
      } else if (userRole === "patient") {
        navigate("/patient");
      } else if (userRole === "admin") {
        navigate("/admin");
      }
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-background">
      <EmergencyBanner />
      
      <div className="bg-white dark:bg-gray-900 py-4 border-b dark:border-gray-800 sticky top-0 z-10">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MobileNavigation isLoggedIn={isLoggedIn} userRole={userRole} />
            <Link to="/" className="text-2xl font-bold text-primary">MediConnect</Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            
            {!isLoggedIn ? (
              <>
                <Link to="/register">
                  <Button variant="outline" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    S'inscrire
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {userRole === "patient" && (
                  <Link to="/patient">
                    <Button>Mon espace patient</Button>
                  </Link>
                )}
                
                {userRole === "doctor" && (
                  <Link to="/doctor">
                    <Button>Mon espace médecin</Button>
                  </Link>
                )}
                
                {userRole === "admin" && (
                  <Link to="/admin">
                    <Button>Administration</Button>
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <main className="flex-grow">
        <Hero />
        
        <div className="bg-white dark:bg-gray-900 py-8 border-y dark:border-gray-800">
          <div className="container">
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                100% sécurisé
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Disponible 24h/24
              </span>
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Données protégées
              </span>
            </div>
          </div>
        </div>

        {!(isLoggedIn && userRole === "doctor") && <HowItWorks />}
        
        <section className="py-24 bg-gradient-to-r from-primary to-blue-600">
          <div className="container text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {isLoggedIn 
                ? "Gérez votre santé avec MediConnect" 
                : "Prêt à prendre soin de votre santé ?"}
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              {isLoggedIn && userRole === "doctor"
                ? "Optimisez votre pratique médicale et suivez vos patients"
                : "Rejoignez les milliers de patients qui font confiance à MediConnect pour leur santé."}
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-primary hover:text-primary/90 dark:bg-gray-200"
              onClick={handleGetStarted}
            >
              {isLoggedIn ? "Accéder à mon espace" : "Commencer maintenant"}
            </Button>
          </div>
        </section>

        <Features />
        <Statistics />
        {!(isLoggedIn && userRole === "doctor") && <Testimonials />}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
