import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Calendar, Heart, MessageSquare, Shield, Clock, Users, ArrowRight, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import { HeroCarousel } from "./HeroCarousel";

export const Hero = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  const handleBookAppointment = () => {
    if (user && userRole === "doctor") {
      navigate("/doctor");
      return;
    }
    navigate("/find-doctor");
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 md:py-24 px-4">
      {/* Premium background */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 to-medical-mint/8 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [45, 0, 45],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-medical-mint/8 to-primary/8 rounded-full blur-3xl"
        />
        
        {/* Floating medical icons */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 opacity-20"
        >
          <Stethoscope className="w-16 h-16 text-primary" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 opacity-20"
        >
          <Heart className="w-12 h-12 text-secondary" />
        </motion.div>
      </div>

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-card px-5 py-2.5 rounded-full shadow-soft border border-border/50"
          >
            <div className="w-2 h-2 rounded-full bg-medical-mint animate-pulse-soft" />
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Plateforme sécurisée et certifiée</span>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.1] tracking-tight">
              Votre santé,{" "}
              <span className="gradient-text">notre priorité</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Prenez rendez-vous avec les meilleurs médecins en quelques clics. 
              Simple, rapide et sécurisé.
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3 justify-center lg:justify-start"
          >
            {[
              { icon: Clock, text: "Disponible 24/7", color: "text-primary" },
              { icon: Users, text: "500+ Médecins", color: "text-medical-mint" },
              { icon: Heart, text: "50k+ Patients", color: "text-secondary" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-soft border border-border/30"
              >
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center lg:justify-start"
          >
            <Button
              size="lg"
              onClick={handleBookAppointment}
              className="text-base md:text-lg px-6 md:px-8 py-6 rounded-2xl bg-gradient-primary shadow-medium hover:shadow-strong transition-all hover:scale-[1.02] group"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Trouver un médecin
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            {!user && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/register?role=patient")}
                className="text-base md:text-lg px-6 md:px-8 py-6 rounded-2xl border-2 hover:bg-accent hover:border-primary/30 transition-all"
              >
                <Heart className="mr-2 h-5 w-5" />
                S'inscrire
              </Button>
            )}

            {user && userRole === "patient" && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/patient/dashboard")}
                className="text-base md:text-lg px-6 md:px-8 py-6 rounded-2xl border-2"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Mon espace patient
              </Button>
            )}

            {user && userRole === "doctor" && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/doctor/dashboard")}
                className="text-base md:text-lg px-6 md:px-8 py-6 rounded-2xl border-2"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Mon espace médecin
              </Button>
            )}
          </motion.div>

          {/* Doctor CTA */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground"
          >
            Vous êtes médecin ?{" "}
            <a href="/join-us" className="text-primary hover:text-primary-dark font-semibold link-underline">
              Rejoignez notre plateforme →
            </a>
          </motion.p>
        </motion.div>

        {/* Right - Carousel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative"
        >
          <div className="relative z-10">
            <HeroCarousel />
          </div>

          {/* Decorative elements */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-medical-mint/20 rounded-3xl blur-2xl -z-10" />
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
};
