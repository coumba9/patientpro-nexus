
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { Statistics } from "@/components/Statistics";
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { AdminQuickAccess } from "@/components/AdminQuickAccess";
import { useEffect, useState } from "react";

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Simulation de vérification du rôle administrateur
    // Dans une application réelle, cela viendrait d'un système d'authentification
    const checkIfAdmin = () => {
      // Ceci est une simulation, à remplacer par votre logique réelle
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const userRole = localStorage.getItem("userRole");
      
      console.info("Index component - checking login status:", isLoggedIn, "role:", userRole);
      
      if (isLoggedIn === "true" && userRole === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkIfAdmin();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <EmergencyBanner />
      <Hero />
      
      {isAdmin && (
        <div className="container mx-auto px-4 mb-8">
          <AdminQuickAccess />
        </div>
      )}
      
      <Features />
      <HowItWorks />
      <Statistics />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
