
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Statistics } from "@/components/Statistics";
import { Testimonials } from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Heart } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <EmergencyBanner />
      <main className="flex-grow">
        <Hero />
        
        {/* Banner de confiance */}
        <div className="bg-white py-8 border-y">
          <div className="container">
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
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

        <HowItWorks />
        
        {/* Call to Action */}
        <section className="py-24 bg-gradient-to-r from-primary to-blue-600">
          <div className="container text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à prendre soin de votre santé ?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez les milliers de patients qui font confiance à MediConnect pour leur santé.
            </p>
            <Button size="lg" variant="secondary" className="text-primary hover:text-primary/90">
              Commencer maintenant
            </Button>
          </div>
        </section>

        <Features />
        <Statistics />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
