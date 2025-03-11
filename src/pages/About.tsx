
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <div className="relative bg-gradient-to-b from-sky-50 to-white pt-24 pb-32">
        <div className="container relative z-10">
          <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            À propos de MediConnect
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Notre mission est de révolutionner l'accès aux soins de santé en France en connectant patients et professionnels de santé sur une plateforme innovante.
          </p>
        </div>
      </div>

      <div className="container py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 text-primary">Notre Vision</h3>
            <p className="text-gray-600">
              Faciliter l'accès aux soins pour tous, partout en France, grâce à la technologie et l'innovation.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 text-primary">Notre Équipe</h3>
            <p className="text-gray-600">
              Une équipe passionnée de professionnels de santé, d'experts en technologie et en expérience utilisateur.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 text-primary">Notre Impact</h3>
            <p className="text-gray-600">
              Plus de 100 000 patients satisfaits et 10 000 professionnels de santé connectés sur notre plateforme.
            </p>
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link to="/contact">
            <Button size="lg" className="group">
              Contactez-nous
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
