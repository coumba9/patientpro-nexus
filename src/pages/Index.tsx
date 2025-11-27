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
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useAuth } from "@/hooks/useAuth";
const Index = () => {
  const navigate = useNavigate();
  const {
    user,
    userRole,
    loading,
    logout
  } = useAuth();
  const handleGetStarted = () => {
    if (user) {
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
  const fadeIn = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <div className="min-h-screen flex flex-col dark:bg-background">
      <EmergencyBanner />
      
      <div className="bg-white dark:bg-gray-900 py-4 border-b dark:border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 transition-all duration-200">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MobileNavigation isLoggedIn={!!user} userRole={userRole} />
            <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">JàmmSanté</Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <nav className="mr-4">
              <ul className="flex items-center gap-6">
                <li><Link to="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Comment ça marche</Link></li>
                <li><Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Tarifs</Link></li>
                <li><Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">À propos</Link></li>
              </ul>
            </nav>
            
            <ThemeToggle />
            
            {!user ? <>
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
              </> : <>
                {userRole === "patient" && <Link to="/patient">
                    <Button className="gap-2">
                      Mon espace patient
                    </Button>
                  </Link>}
                
                {userRole === "doctor" && <Link to="/doctor">
                    <Button className="gap-2">
                      Mon espace médecin
                    </Button>
                  </Link>}
                
                {userRole === "admin" && <Link to="/admin">
                    <Button className="gap-2">
                      Administration
                    </Button>
                  </Link>}
              </>}
          </div>

          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <main className="flex-grow">
        <Hero />
        
        <motion.div initial="hidden" whileInView="visible" viewport={{
        once: true
      }} transition={{
        duration: 0.8
      }} variants={fadeIn} className="bg-white dark:bg-gray-900 py-8 border-y dark:border-gray-800">
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
        </motion.div>

        {!(user && userRole === "doctor") && <HowItWorks />}
        
        <motion.section initial="hidden" whileInView="visible" viewport={{
        once: true
      }} transition={{
        duration: 0.5
      }} variants={fadeIn} className="py-24 bg-gradient-to-r from-primary to-blue-600 relative overflow-hidden">
          <div className="container relative z-10 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {user ? "Gérez votre santé avec JàmmSanté" : "Prêt à prendre soin de votre santé ?"}
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              {user && userRole === "doctor" ? "Optimisez votre pratique médicale et suivez vos patients" : "Rejoignez les milliers de patients qui font confiance à JàmmSanté pour leur santé."}
            </p>
            <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-primary hover:text-primary/90 shadow-lg hover:shadow-xl transition-all bg-primary-foreground">
              {user ? "Accéder à mon espace" : "Commencer maintenant"}
            </Button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        </motion.section>

        <Features />
        <Statistics />
        {!(user && userRole === "doctor") && <Testimonials />}
      </main>
      <Footer />
    </div>;
};
export default Index;