import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Calendar, Heart, MessageSquare, Shield, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { HeroCarousel } from "./HeroCarousel";
export const Hero = () => {
  const navigate = useNavigate();
  const {
    user,
    userRole,
    loading
  } = useAuth();
  const handleBookAppointment = () => {
    if (user && userRole === "doctor") {
      navigate("/doctor");
      return;
    }
    navigate("/find-doctor");
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Enhanced background with medical theme */}
      <div className="absolute inset-0 bg-[var(--gradient-subtle)]" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0]
      }} transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      }} className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        <motion.div animate={{
        scale: [1.2, 1, 1.2],
        rotate: [90, 0, 90]
      }} transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      }} className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div initial={{
        opacity: 0,
        x: -50
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.8
      }} className="space-y-10 text-center lg:text-left">
          <div className="space-y-6">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="inline-flex items-center gap-2 bg-medical-light px-4 py-2 rounded-full">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Plateforme sécurisée et certifiée</span>
            </motion.div>

            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3
          }} className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Votre santé,{" "}
              <span className="bg-clip-text bg-[var(--gradient-primary)] text-accent-foreground">
                notre priorité
              </span>
            </motion.h1>

            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Prenez rendez-vous avec les meilleurs médecins en quelques clics. 
              Simple, rapide et sécurisé.
            </motion.p>
          </div>

          {/* Feature Pills */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5
        }} className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-soft">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Disponible 24/7</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-soft">
              <Users className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">500+ Médecins</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-soft">
              <Heart className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">50k+ Patients</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6
        }} className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <Button size="lg" onClick={handleBookAppointment} className="text-lg px-8 py-6 shadow-medium hover:shadow-strong transition-all bg-[var(--gradient-primary)] hover:scale-105">
              <Calendar className="mr-2 h-5 w-5" />
              Trouver un médecin
            </Button>

            {!user && <>
                <Button variant="outline" size="lg" onClick={() => navigate("/register?role=patient")} className="text-lg px-8 py-6 border-2 hover:bg-medical-light">
                  <Heart className="mr-2 h-5 w-5" />
                  S'inscrire (Patient)
                </Button>
                <Button variant="ghost" size="lg" onClick={() => navigate("/login")} className="text-lg px-8 py-6 hover:bg-medical-light">
                  Connexion
                </Button>
              </>}

            {user && userRole === "patient" && <Button variant="outline" size="lg" onClick={() => navigate("/patient/dashboard")} className="text-lg px-8 py-6 border-2">
                <MessageSquare className="mr-2 h-5 w-5" />
                Mon espace patient
              </Button>}

            {user && userRole === "doctor" && <Button variant="outline" size="lg" onClick={() => navigate("/doctor/dashboard")} className="text-lg px-8 py-6 border-2">
                <MessageSquare className="mr-2 h-5 w-5" />
                Mon espace médecin
              </Button>}
          </motion.div>

          <motion.p initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.7
        }} className="text-sm text-muted-foreground">
            Vous êtes médecin ?{" "}
            <a href="/join-us" className="text-primary hover:underline font-semibold">
              Rejoignez notre plateforme →
            </a>
          </motion.p>
        </motion.div>

        {/* Right - Carousel */}
        <motion.div initial={{
        opacity: 0,
        x: 50
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.4,
        duration: 0.8
      }} className="relative">
          <HeroCarousel />

          {/* Decorative floating elements */}
          <motion.div animate={{
          y: [0, -15, 0]
        }} transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }} className="absolute -top-8 -right-8 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
          <motion.div animate={{
          y: [0, 15, 0]
        }} transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }} className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />
        </motion.div>
      </div>
    </section>;
};