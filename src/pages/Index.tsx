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

// Medical cross SVG component
const MedicalCross = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
  </svg>
);

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole, loading, logout } = useAuth();

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Global decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -left-40 w-80 h-80 bg-medical-mint/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"
        />
        
        {/* Floating medical crosses */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[15%]"
        >
          <MedicalCross className="w-8 h-8 text-primary/10" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 left-[10%]"
        >
          <MedicalCross className="w-6 h-6 text-medical-mint/10" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/3 right-[20%]"
        >
          <MedicalCross className="w-10 h-10 text-primary/5" />
        </motion.div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <EmergencyBanner />
      
      {/* Professional Header */}
      <header className="glass-strong py-4 sticky top-0 z-50 transition-all duration-300">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MobileNavigation isLoggedIn={!!user} userRole={userRole} />
            <Link to="/" className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft"
              >
                <Heart className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="text-2xl font-display font-bold gradient-text">JàmmSanté</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-6">
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors font-medium link-underline">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium link-underline">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium link-underline">
                  À propos
                </Link>
              </li>
            </ul>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {!user ? (
                <>
                  <Link to="/register">
                    <Button variant="outline" className="gap-2 rounded-xl border-2 hover:bg-accent">
                      <UserPlus className="h-4 w-4" />
                      S'inscrire
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button className="gap-2 rounded-xl bg-gradient-primary shadow-soft hover:shadow-medium transition-all">
                      <LogIn className="h-4 w-4" />
                      Connexion
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {userRole === "patient" && (
                    <Link to="/patient">
                      <Button className="gap-2 rounded-xl bg-gradient-primary shadow-soft">
                        Mon espace patient
                      </Button>
                    </Link>
                  )}
                  {userRole === "doctor" && (
                    <Link to="/doctor">
                      <Button className="gap-2 rounded-xl bg-gradient-primary shadow-soft">
                        Mon espace médecin
                      </Button>
                    </Link>
                  )}
                  {userRole === "admin" && (
                    <Link to="/admin">
                      <Button className="gap-2 rounded-xl bg-gradient-primary shadow-soft">
                        Administration
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </nav>

          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Hero />

        {!(user && userRole === "doctor") && <HowItWorks />}
        
        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={fadeIn}
          className="py-24 relative overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-primary" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="container relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-primary-foreground">
                {user ? "Gérez votre santé avec JàmmSanté" : "Prêt à prendre soin de votre santé ?"}
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 leading-relaxed">
                {user && userRole === "doctor"
                  ? "Optimisez votre pratique médicale et suivez vos patients"
                  : "Rejoignez les milliers de patients qui font confiance à JàmmSanté pour leur santé."}
              </p>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="text-lg px-10 py-6 rounded-2xl bg-card text-primary hover:bg-card/90 shadow-strong hover:shadow-glow transition-all font-display font-semibold"
              >
                {user ? "Accéder à mon espace" : "Commencer maintenant"}
              </Button>
            </motion.div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </motion.section>

        <Features />
        <Statistics />
        {!(user && userRole === "doctor") && <Testimonials />}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
