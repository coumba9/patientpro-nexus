import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';

const Hero = () => {
  useEffect(() => {
    // Pour la démo, simulons une connexion administrateur
    // Ceci est temporaire pour tester les fonctionnalités administrateur
    const simulateAdminLogin = () => {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "admin");
      console.info("Hero component - checking login status:", localStorage.getItem("isLoggedIn"), "role:", localStorage.getItem("userRole"));
    };
    simulateAdminLogin();
  }, []);

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4">
        <div className="lg:flex items-center">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Votre santé, notre priorité. Trouvez le meilleur médecin près de chez vous.
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Prenez rendez-vous facilement et rapidement avec des professionnels de santé qualifiés.
            </p>
            <div className="flex space-x-4">
              <Link to="/find-doctor">
                <Button size="lg">
                  Trouver un médecin <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/teleconsultation">
                <Button variant="outline" size="lg">
                  Téléconsultation
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            <img
              src="/hero-image.svg"
              alt="Médecin et patient"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
